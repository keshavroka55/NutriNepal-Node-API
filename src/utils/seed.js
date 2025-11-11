// src/utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

console.log('seed: cwd =', process.cwd());
console.log('seed: MONGODB_URI =', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//<redacted>@') : 'undefined');

const User = require(path.join(process.cwd(), 'src', 'models', 'UserModel'));
const Food = require(path.join(process.cwd(), 'src', 'models', 'Food'));
const UserLog = require(path.join(process.cwd(), 'src', 'models', 'UserLog'));

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not set in .env (seed aborted)');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected for seed to DB:', mongoose.connection.name);

    // --- 1) Create admin if provided via env ---
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;
    let adminUser = null;
    if (adminEmail && adminPass) {
      adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        adminUser = new User({
          username: 'admin',
          email: adminEmail,
          password: adminPass,
          role: 'admin'
        });
        await adminUser.save(); // password hashed by model pre-save
        console.log('Admin user created:', adminEmail, 'id:', adminUser._id.toString());
      } else {
        console.log('Admin already exists:', adminEmail, 'id:', adminUser._id.toString());
      }
    } else {
      console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin creation.');
    }

    // --- 2) Insert sample foods (if not exists) ---
    const samples = [
      { name_en: 'Boiled Egg', name_np: 'उबालिएको अण्डा', serving_size: 50, serving_unit: 'g', calories_kcal: 78, protein_g: 6.5, fat_g: 5.3, carbs_g: 0.6, category: 'Non-Vegetarian', source: 'local_sample', aliases: ['anda','boiled egg'] },
      { name_en: 'Cooked White Rice', name_np: 'भात', serving_size: 100, serving_unit: 'g', calories_kcal: 130, protein_g: 2.4, fat_g: 0.2, carbs_g: 28, category: 'Grain', source: 'local_sample', aliases: ['bhaat','rice'] },
      { name_en: 'Masoor Dal (cooked)', name_np: 'दाल', serving_size: 100, serving_unit: 'g', calories_kcal: 116, protein_g: 9, fat_g: 0.4, carbs_g: 20, category: 'Legume', source: 'local_sample', aliases: ['dal','masoor'] }
    ];

    let insertedFoods = 0;
    for (const s of samples) {
      const exists = await Food.findOne({ name_en: s.name_en });
      if (!exists) {
        const doc = await new Food(s).save();
        console.log('Inserted food:', doc.name_en, 'id:', doc._id.toString());
        insertedFoods++;
      } else {
        console.log('Skipped (exists):', s.name_en, 'id:', exists._id.toString());
      }
    }
    const totalFoods = await Food.countDocuments();
    console.log(`Foods: inserted ${insertedFoods}, total in DB: ${totalFoods}`);

    // --- 3) Create sample user (non-admin) for logs if none exists ---
    let sampleUser = await User.findOne({ email: 'sampleuser@example.com' });
    if (!sampleUser) {
      sampleUser = new User({
        username: 'sampleuser',
        email: 'sampleuser@example.com',
        password: 'sample123', // will be hashed by model
        role: 'user'
      });
      await sampleUser.save();
      console.log('Sample user created:', sampleUser.email, 'id:', sampleUser._id.toString());
    } else {
      console.log('Sample user exists:', sampleUser.email, 'id:', sampleUser._id.toString());
    }

    // Debug prints: confirm model schema paths
    console.log('UserLog schema paths:', Object.keys(UserLog.schema.paths));

    // --- 4) Create safe sample logs (only if food(s) & user exist) ---
    const foodsAll = await Food.find({}).limit(10);
    console.log('Found foods count for logs:', foodsAll.length);

    if (!sampleUser) {
      console.log('No sampleUser found. Skipping UserLog creation.');
    } else if (!foodsAll || foodsAll.length === 0) {
      console.log('No foods found in DB. Skipping UserLog creation.');
    } else {
      let createdLogs = 0;
      for (const f of foodsAll) {
        if (!f || !f._id) {
          console.log('Skipping invalid food entry:', f);
          continue;
        }

        // use serving_size as default quantity
        const quantity = (typeof f.serving_size === 'number' && f.serving_size > 0) ? f.serving_size : 100;
        const unit = f.serving_unit || 'g';

        // nutrient scaling
        const factor = (f.serving_size && f.serving_size > 0) ? (quantity / f.serving_size) : 1;
        const calories = Math.round(((f.calories_kcal || 0) * factor) * 100) / 100;
        const protein = Math.round(((f.protein_g || 0) * factor) * 100) / 100;
        const fat = Math.round(((f.fat_g || 0) * factor) * 100) / 100;
        const carbs = Math.round(((f.carbs_g || 0) * factor) * 100) / 100;

        // Build payload using expected names (user, food, quantity)
        const payload = {
          quantity,
          unit,
          timestamp: new Date(),
          calories_kcal: calories,
          protein_g: protein,
          fat_g: fat,
          carbs_g: carbs
        };

        // Attach user & food fields according to schema paths
        if (UserLog.schema.path('user')) payload.user = sampleUser._id;
        else if (UserLog.schema.path('user_id')) payload.user_id = sampleUser._id;
        else if (UserLog.schema.path('owner')) payload.owner = sampleUser._id;

        if (UserLog.schema.path('food')) payload.food = f._id;
        else if (UserLog.schema.path('food_id')) payload.food_id = f._id;
        else if (UserLog.schema.path('item')) payload.item = f._id;

        console.log('Saving UserLog payload (user,food,quantity):', {
          user: payload.user ? payload.user.toString() : payload.user_id ? payload.user_id.toString() : payload.owner ? payload.owner.toString() : null,
          food: payload.food ? payload.food.toString() : payload.food_id ? payload.food_id.toString() : payload.item ? payload.item.toString() : null,
          quantity: payload.quantity
        });

        try {
          const log = new UserLog(payload);
          await log.save();
          console.log('Inserted log for food:', f.name_en, 'log id:', log._id.toString());
          createdLogs++;
        } catch (err) {
          console.warn('Failed saving log for food', f.name_en, err && err.message ? err.message : err);
        }
      }
      console.log(`Created ${createdLogs} user logs.`);
    }

    console.log('Seeding done.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.warn('Seed error:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

// call the async seed()
seed();

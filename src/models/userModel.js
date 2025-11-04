const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // select: false, // password won't be returned unless you explicitly .select('+password')
    },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// encrypted the password fields. 
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// while login it will compare original and hased password. 
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

// module.exports = User;





// pre is a function provided by mongoose. 
// before creating userSchema. 
// next is parameter that will execute after this code. 

// .hash method is used to decrypt the password. 
// encrypted after hashing the password. 
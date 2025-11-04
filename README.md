# Blog Application API (MEN Stack)

A complete backend API for a blog application using **MongoDB, Express, and Node.js (MEN Stack)** with multiple models and CRUD functionality.

---

## Table of Contents
- [Objective](#objective)
- [Features](#features)
- [Models](#models)
- [API Routes](#api-routes)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Postman Testing](#postman-testing)
- [License](#license)

---

## Objective
Build a backend for a blog application with user authentication, post management, comments, and likes.  
The API supports CRUD operations with proper authorization and relational data between users, posts, comments, and likes.

---

## Features
- User registration and login with **JWT authentication**
- Role-based authorization (`user`, `admin`, `superAdmin`)
- Password encryption using **bcrypt**
- CRUD operations for posts, comments, and likes
- Only post/comment owners can update or delete their content
- Prevent multiple likes by the same user
- Aggregation for total likes per post

---

## Models

### **UserModel**
- **Fields**: `username`, `email`, `password`, `role` (default: `"user"`), `createdAt`
- **Features**:
  - Password hashing using bcrypt
  - One-to-many relation with posts and comments

### **PostModel**
- **Fields**: `title`, `content`, `author` (ObjectId ref: User), `likes` (Number or Array of User IDs), `createdAt`, `updatedAt`
- **Features**:
  - One-to-many relation with comments
  - CRUD operations (create, read, update, delete)
  - Only the post owner can edit or delete

### **CommentModel**
- **Fields**: `post` (ObjectId ref: Post), `user` (ObjectId ref: User), `content`, `createdAt`
- **Features**:
  - CRUD operations (add, update, delete)

### **LikeModel** (optional)
- **Fields**: `user` (ObjectId ref: User), `post` (ObjectId ref: Post)
- **Features**:
  - Prevent multiple likes by the same user
  - Count total likes per post using aggregation

---

## API Routes

### **User Routes**
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login a user |
| GET | `/api/users/:id` | Get user profile |
| DELETE | `/api/users/:id` | Delete a user (admin only) |

### **Post Routes**
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/v1/blog/create-blog` | Create a new blog |
| GET | `/api/v1/blog/all` | Get all blog |
| GET | `/api/v1/blog/:blogId` | Get single blog |
| PUT | `/api/v1/blog/:blogId` | Update blog (owner only) |
| DELETE | `/api/v1/blog/:blogId` | Delete blog (owner only) |

### **Comment Routes**
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/comments/` | Add comment to a blog |
| PUT | `/api/comments/:blogId` | Update a comment |
| DELETE | `/api/comments/:blogId` | Delete a comment |

### **Like Routes**
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/likes/:id/like` | Like a blog |
| DELETE | `/api/likes/:id/unlike` | Unlike a blog |

---

## Installation

1. Clone the repository:
```bash
git clone [https://github.com/yourusername/blog-api.git](https://github.com/keshavroka55/Node-blog-backend/tree/master)
cd blog-api

const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 15,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: 4,
      maxLength: 15,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 10,
      maxLength: 50,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("please enter valid email address");
        }
      },
    },
    password: {
      type: String,
      minLength: 7,
      maxLength: 70,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please enter Strong Password");
        }
      },
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Please enter valid input");
        }
      },
    },
    about: {
      type: String,
      default: "Just want to check how the app is working!",
    },
    photoUrl: {
      type: String,
      default: "https://www.example.com/default-profile-pic.jpg",
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 70,
    },
    skills: [String],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema); // model represents class/model that's why we are using Capital U

module.exports = User;

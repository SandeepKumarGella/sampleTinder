const express = require("express");
const authRouter = express.Router();
const User = require("../Database/models/user");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/userAuth");

authRouter.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    age,
    skills,
    gender,
    about,
    photoUrl,
  } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists");
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      age,
      skills,
      gender,
      about,
      photoUrl,
    });
    await user.save();
    const userData = await User.findOne({ email });
    let token = await jwt.sign({ _id: userData?._id }, "Sandeep@016", {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false, // true in production (HTTPS)
    });

    res.status(200).json({
      message: "user created successfully",
      user: {
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photoUrl: userData.photoUrl,
        age: userData.age,
        skills: userData.skills,
        about: userData.about,
        gender: userData.gender,
      },
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

authRouter.post("/signin", userAuth, (req, res) => {
  let user = req.user;
  if (!user) {
    return res.status(404).send("User not found");
  }
  try {
    res.status(200).json({
      message: `Hi ${req?.user?.firstName} Welcome to the Dev Tinder`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        age: user.age,
        skills: user.skills,
        about: user.about,
        gender: user.gender,
      },
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

authRouter.post("/signout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send("user logout successfully!");
  } catch (err) {
    res.status(400).send("Failed to logout " + err.message);
  }
});

module.exports = authRouter;

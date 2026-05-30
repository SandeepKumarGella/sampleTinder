const express = require("express");
const authRouter = express.Router();
const User = require("../Database/models/user");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/userAuth");

authRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, age, skills, gender } =
    req.body;
  const existingUser = await User.findOne({ email });
  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    if (existingUser) {
      return res.status(400).send("User already exists");
    }
    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      age,
      skills,
      gender,
    });
    await user.save();
    const userId = await User.findOne({ email });
    res.status(200).json({
      message: "user created successfully",
      userId: userId?._id,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

authRouter.post("/signin", userAuth, (req, res) => {
  try {
    res
      .status(200)
      .json({
        message: `Hi ${req?.user?.firstName} Welcome to the Dev Tinder`,
        user: req?.user,
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

const express = require("express");
const User = require("../Database/models/user");
const profileAuth = require("../middlewares/profileAuth");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

profileRouter.get("/profile/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(400).send("user not found!");
  }
  try {
    res.status(200).json({
      message: "user data fetched Successfully!",
      userDetails: user,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.patch("/editProfile", profileAuth, async (req, res) => {
  const editableFields = ["skills", "about", "photoUrl"];

  const fieldsToUpdate = Object.keys(req.body)
    .filter((key) => editableFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // current user
      { $set: fieldsToUpdate },
      { new: true, runValidators: true },
    );

    await updatedUser.save();
    res.status(200).json({
      message: "user updated successfully",
      updatedDetails: updatedUser,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.delete("/deleteProfile", profileAuth, async (req, res) => {
  try {
    let user = req.user;
    let deletedUser = await User.findByIdAndDelete(user._id);
    res.status(200).json({
      message: "user deleted from DB successfully!",
      deletedUserdetails: deletedUser,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.patch("/forgotPassword", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send("User not Found");
    }
    let newPassword = await bcrypt.hash(password, 10);

    let updatedPassword = await User.findByIdAndUpdate(user?._id, {
      password: newPassword,
    });
    await updatedPassword.save();
    res.status(200).json({
      message: "password updated successfully!",
      newPassword: updatedPassword,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

module.exports = profileRouter;

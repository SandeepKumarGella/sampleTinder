const User = require("../Database/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      return res.status(400).send("User not found");
    }
    let isPasswordMatch = await bcrypt.compare(password, userDetails.password);
    if (!isPasswordMatch) {
      return res.status(400).send("Password mismatch");
    }
    let token = await jwt.sign({ _id: userDetails._id }, "Sandeep@016", {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false, // true in production (HTTPS)
    });
    req.user = userDetails;
    next();
  } catch (err) {
    res.status(400).send("login Authentication Failed " + err.message);
  }
};

module.exports = userAuth;

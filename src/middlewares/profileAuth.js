const jwt = require("jsonwebtoken");
const User = require("../Database/models/user");

const profileAuth = async (req, res, next) => {
  try {
    let { email } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send("Invalid Credetails");
    }
    let token = req.cookies.token;
    let verifyToken = jwt.verify(token, "Sandeep@016");
    if (!verifyToken) {
      return res.status(400).send("Invalid user");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = profileAuth;

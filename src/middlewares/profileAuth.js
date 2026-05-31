const jwt = require("jsonwebtoken");
const User = require("../Database/models/user");

const profileAuth = async (req, res, next) => {
  try {
    let token = req?.cookies?.token;
    if (!token) {
      return res.status(401).send("Unauthorized user!");
    }
    let decoded = jwt.verify(token, "Sandeep@016");

    if (!decoded) {
      return res.status(400).send("Invalid user");
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).send("User not Found!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = profileAuth;

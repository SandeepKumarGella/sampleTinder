const express = require("express");
const userRouter = express.Router();
const profileAuth = require("../middlewares/profileAuth");
const connectionRequest = require("../Database/models/connectionRequest");
const User = require("../Database/models/user");
const ConnectionRequest = require("../Database/models/connectionRequest");

let USER_DB_SAFE_DATA = ["firstName", "lastName", "age", "skills"];
//get all pending connection request for loggedIn User
userRouter.get("/user/requests/received", profileAuth, async (req, res) => {
  try {
    let loggedInUser = req.user;
    let connectionRequests = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName", "age", "skillset"]);

    if (!connectionRequests) {
      return res.status(404).send("User not Found");
    }
    res.status(200).json({
      message: "connection requests fetched Successfully",
      pendingRequests: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

userRouter.get("/user/connections", profileAuth, async (req, res) => {
  try {
    let loggedInUser = req.user;
    const connectionRequests = await connectionRequest
      .find({
        $or: [
          { toUserId: loggedInUser, status: "accepted" },
          { fromUserId: loggedInUser, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_DB_SAFE_DATA)
      .populate("toUserId", USER_DB_SAFE_DATA);

    if (!connectionRequests) {
      return res.status(404).send("User not Found!");
    }
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({
      message: "Data fetched Successfully!",
      data: data,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

//get user Feed - not include himself, requested profiles, ignored profiles, received profiles
userRouter.get("/feed", profileAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    let skip = (page - 1) * limit;

    let connectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_DB_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "User profile fetched Successfully",
      users,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});
module.exports = userRouter;

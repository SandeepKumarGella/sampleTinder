const express = require("express");
const requestRouter = express.Router();
const ConnectionRequest = require("../Database/models/connectionRequest");
const profileAuth = require("../middlewares/profileAuth");

requestRouter.post(
  "/request/send/:status/:id",
  profileAuth,
  async (req, res) => {
    try {
      let fromUserId = req.user._id;
      let toUserId = req.params.id;
      let status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid Status");
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send("user already exist in DB");
      }

      let requestConnect = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await requestConnect.save();

      res.status(200).json({
        message: "connection api trigger",
        connections: data,
      });
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:fromUserId",
  profileAuth,
  async (req, res) => {
    const { status, fromUserId } = req.params;
    const user = req.user;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send("Invalid Status");
    }
    try {
      const connectionData = await ConnectionRequest.findOneAndUpdate(
        {
          fromUserId: fromUserId,
          toUserId: user._id,
          status: "interested",
        },
        {
          status: status,
        },
        { new: true },
      );
      console.log("connectionData", connectionData);
      if (!connectionData) {
        return res.status(404).send("User not found");
      }

      res.status(200).json({
        message: "All connection Requests",
        connectionRequests: connectionData,
      });
    } catch (err) {
      res.status(400).json({
        message: "error " + err.message,
      });
    }
  },
);
module.exports = requestRouter;

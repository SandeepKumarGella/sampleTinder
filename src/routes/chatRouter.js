const express = require("express");
const profileAuth = require("../middlewares/profileAuth");
const Chat = require("../Database/models/chat");
const chatRouter = express.Router();

chatRouter.get("/chats/:toUserId", profileAuth, async (req, res) => {
  const userId = req.user?._id;
  const toUserId = req.params?.toUserId;
  try {
    let chatHistory = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName photoUrl",
    });

    if (!chatHistory) {
      chatHistory = new Chat({
        participants: [userId, toUserId],
        messages: [],
      });
      await chatHistory.save();
    }

    res.status(200).json(chatHistory);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = chatRouter;

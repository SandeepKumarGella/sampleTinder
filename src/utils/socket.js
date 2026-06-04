const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../Database/models/chat");

const getSecretRoomId = (userId, toUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, toUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinChat", ({ firstName, userId, toUserId }) => {
      const roomId = getSecretRoomId(userId, toUserId);
      socket.join(roomId);
      console.log(firstName + " Client joined chat", roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, text, userId, toUserId, profileurl }) => {
        console.log("Message received:", { firstName, text, userId, toUserId });
        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });
        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }
        chat.messages.push({
          senderId: userId,
          text,
          profileurl,
          createdAt: new Date(),
        });
        await chat.save();
        const roomId = getSecretRoomId(userId, toUserId);
        io.to(roomId).emit("receiveMessage", {
          firstName,
          text,
          userId,
          toUserId,
          profileurl,
        });
      },
    );
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = initializeSocket;

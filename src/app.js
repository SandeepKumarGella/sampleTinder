const express = require("express");
const dbConnect = require("./Database/config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const profileRouter = require("./routes/profileRoutes");
const requestRouter = require("./routes/requestRoutes");
const userRouter = require("./routes/usersRoutes");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.use("/", (req, res) => {
  res.status(200).send("Welcome to Home page");
});

dbConnect()
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(3000, () => {
      console.log(`Server Running Successfully`);
    });
  })
  .catch((err) => {
    console.log("unable to connect the database " + err.message);
  });

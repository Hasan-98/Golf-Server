import { app } from "./app";
const socketio = require("socket.io");
<<<<<<< HEAD
const port = process.env.PORT || 5000;
app.set("port", port);
const test = app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
=======
const port = process.env.PORT || 5002;
app.set("port", port);
const test = app.listen(port, () => {
  console.log(`Listening: http://admin.golf-encounters.com/:${port}`);
>>>>>>> parent of e89cabf (chnges)
});
const corsOptions = {
  origin: ["http://localhost:3000", "https://golf-encounters.com"],
  methods: ["GET", "POST"],
  allowedHeaders: ["my-custom-header"],
  credentials: true,
};
const io = socketio(test, {
  cors: corsOptions,
});
io.on("connection", (socket: any) => {
  console.log("New client connected" + socket);
});
export { io };

import { app } from "./app";
const socketio = require("socket.io");
const port = process.env.PORT || 5000;
app.set("port", port);
const test = app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
const corsOptions = {
  origin: `http://localhost:${port}`,
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

import { app } from "./app";
import https from 'https';
import fs from 'fs';
const socketio = require("socket.io");

const port = process.env.PORT || 5000;
app.set("port", port);

// Read the SSL certificate and private key from files
const privateKey = fs.readFileSync('./certificate/key.pem', 'utf8');
const certificate = fs.readFileSync('./certificate/cert.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
const server = https.createServer(credentials, app);

// const test = app.listen(port, () => {
//   console.log(`Listening: http://localhost:${port}`);
// })

const corsOptions = {
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["my-custom-header"],
  credentials: true,
};
const io = socketio(server, {
  cors: corsOptions,
});

// const io = socketio(test, {
//   cors: corsOptions,
// });
io.on("connection", (socket: any) => {
  console.log("New client connected" + socket);
});

export { io };
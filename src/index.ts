import { app } from "./app";
import https from 'https';
import fs from 'fs';
const socketio = require("socket.io");
<<<<<<< HEAD
const port = process.env.PORT || 5002;
app.set("port", port);
const test = app.listen(port, () => {
  console.log(`Listening: http://admin.golf-encounters.com/:${port}`);
=======

const port = process.env.PORT || 5000;
app.set("port", port);

// Read the SSL certificate and private key from files
const privateKey = fs.readFileSync('./certificate/server.key', 'utf8');
const certificate = fs.readFileSync('./certificate/backend_golf-encounters_com.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
const server = https.createServer(credentials, app);

server.listen(port, () => {
  console.log(`Listening: https://localhost:${port}`);
>>>>>>> c76e62271bc0571a386e184b0239109880d55fb4
});

const corsOptions = {
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["my-custom-header"],
  credentials: true,
};

const io = socketio(server, {
  cors: corsOptions,
});

io.on("connection", (socket: any) => {
  console.log("New client connected" + socket);
});

export { io };
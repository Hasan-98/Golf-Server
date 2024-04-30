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

server.listen(port, () => {
  console.log(`Listening: https://localhost:${port}`);
});

const corsOptions = {
  origin: ["http://localhost:3000", "https://golf-encounters.com"],
  methods: ["GET", "POST"],
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
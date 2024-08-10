import cors from "cors";
import { app } from "./app";
import * as fs from 'fs';
import * as https from 'https';
// import * as http from 'http';
const socketio = require("socket.io");

const port = process.env.PORT || 5000;
app.set("port", port);

// Read the SSL certificate and private key from files
const privateKey = fs.readFileSync('./certificate/server.key', 'utf8');
const certificate = fs.readFileSync('./certificate/backend_golf-encounters_com.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
// const server = http.createServer( app);
const server = https.createServer(credentials, app);

server.listen(port, () => {
  console.log(`Listening: https://localhost:${port}`);
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
<<<<<<< HEAD
io.use(cors(corsOptions));
=======
>>>>>>> f2fff5853667918cc660ad1c44710827a6ccdd91

io.on("connection", (socket: any) => {
  console.log("New client connected" + socket.id);
});

export { io };
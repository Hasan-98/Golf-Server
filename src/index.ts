import { app } from './app';
const socketio = require('socket.io');
const port = process.env.PORT || 5000;
app.set('port', port);


const test = app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
const io = socketio(test);
io.on('connection', (socket: any) => {
  console.log('New client connected');
});

export { io }

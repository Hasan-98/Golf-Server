import { server, app } from './app';

const port = process.env.PORT || 5000;
app.set('port', port);

server.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

import http from "node:http";
import app from "./app.js";

const PORT = process.env.PORT || 80;

const server = http.createServer(app);

async function startServer() {
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

startServer();

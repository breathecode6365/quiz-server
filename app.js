import express from "express";
import requestMatcher from "./requestMatcher.js";
import connectwithdb from "./db.js";
import http from "http";
import { initializeSocket } from "./socket.js";
import cors from "cors";
import path from "path";

const app = express();
const server = http.createServer(app);
await connectwithdb();
initializeSocket(server);
app.use(express.json());
app.use(cors());
app.use("/api", requestMatcher());

server.listen(8080, () => {
  console.log("Server is running on 8080");
});

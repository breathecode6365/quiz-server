import express from "express";
import QuestionController from "./controller/QuestionController.js";
import RoomController from "./controller/RoomController.js";

const router = express.Router();
const requestMatcher = () => {
  router.use("/question", QuestionController);
  router.use("/room", RoomController);
  return router;
};

export default requestMatcher;


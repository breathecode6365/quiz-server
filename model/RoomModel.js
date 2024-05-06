import mongoose from "mongoose";
import questionDAO from "./QuestionModel.js";
const roomModel = mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [
    {
        playerName: {type: String, required: true},
        playerId: {type: String, required: true},
        score: { type: Number, default: 0 },
        verified: { type: Boolean, default: false },
    }
  ],
  questions:[{
    question: String,
    options: [String],
    answer: String
  }],
  stats: {
    draw: { type: Boolean, default: false },
    winner: {type: String, default: ""},
    looser: {type: String, default: ""},
  },
  isPrivate: Boolean,
});
const roomDAO = mongoose.model("rooms", roomModel);
export default roomDAO;
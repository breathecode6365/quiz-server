import mongoose from "mongoose";
const questionModel = mongoose.Schema({
    question: String,
    options: [String],
    answer: String
});
const questionDAO = mongoose.model("questions", questionModel);
export default questionDAO;
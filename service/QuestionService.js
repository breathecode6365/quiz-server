import e from "express";
import questionDAO from "../model/QuestionModel.js";

class QuestionService {
  constructor() {
    this.questions = [];
  }
  async addQuestion(body, res) {
    const question = body;
    const qst = question.question;
    const opt = question.options;
    const ans = question.answer;
    if (qst == null || opt == null || ans == null) {
      return res.status(400).json({ message: "Question Details incomplete" });
    }
    try {
      const q = await questionDAO.create(question);
      return res.status(201).json({ message: "Question added successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Error in adding question" });
    }
  }
  async getQuestions(res) {
    try {
      const questions = await questionDAO.find();
      return res.status(200).json(questions);
    } catch (err) {
      return res.status(500).json({ message: "Error in fetching questions" });
    }
  }
    async deleteQuestion(id, res) {
        try {
        const q = await questionDAO.findByIdAndDelete(id);
        if (q == null) {
            return res.status(404).json({ message: "Question not found" });
        }
        return res.status(200).json({ message: "Question deleted successfully" });
        } catch (err) {
        return res.status(500).json({ message: "Error in deleting question" });
        }
    }
    async getGameQuestions(res) {
      try {
        const allQuestions = await questionDAO.find();
        let questions = [];
        for (let i = 0; i < allQuestions.length; i++) {
          const j = Math.floor(Math.random() * (i + 1));
          [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
        }
        for (let i = 0; i < 5; i++) {
          questions.push(allQuestions[i]);
        }
        console.log("Added to room Qstions: ",questions);
        return questions;

      } catch (err) {
        return null;
      }
    }
    async getQuestionById(id) {
      return await questionDAO.findById(id);
    }
}
export default QuestionService;
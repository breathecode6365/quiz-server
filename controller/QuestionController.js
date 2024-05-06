import express from 'express';
import QuestionService from '../service/QuestionService.js';

const router = express.Router();
const questionService = new QuestionService();
router.get("/", (req, res) => {
    return questionService.getQuestions(res);
});
router.post("/",(req,res)=>{
    console.log(req.body);
    if(!req.body){
        return res.status(400).send({message: "Question Details incomplete"});
    }
    return (questionService.addQuestion(req.body,res));

})

router.delete("/:id",(req,res)=>{
    const id = req.params.id;
    if(!id){
        return res.status(400).send({message: "Question Details incomplete"});
    }
    return (questionService.deleteQuestion(id,res));
})
router.get("/:id",async (req,res)=>{
    const id = req.params.id;
    if(!id){
        return res.status(400).send({message: "Question Id not provided"});
    }
    let question = await questionService.getQuestionById(id);
    if(!question){
        return res.status(404).send({message: "Question not found"});
    }
    return res.status(200).send(question);
})


export default router;
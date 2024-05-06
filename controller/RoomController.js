import express from 'express';
import RoomService from '../service/RoomService.js';

const router = express.Router();
const roomService = new RoomService();
//get room details with roomId
router.get("/:id",async (req,res)=>{
    const id = req.params.id;
    if(!id){
        return res.status(400).send({message: "Room Id not provided"});
    }
    let room = await roomService.getRoomById(id);
    if(!room){
        return res.status(404).send({message: "Room not found"});
    }
    return res.status(200).send(room);
})

export default router;
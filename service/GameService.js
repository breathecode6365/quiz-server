import RoomService from './RoomService.js';
import { getIo } from '../socket.js';
import QuestionService from './QuestionService.js';
const roomService = new RoomService();
const questionService = new QuestionService();
class GameService{
    async joinGameByPrivateId (RoomId,player){
        let room = await roomService.joinRoomByPrivateId(RoomId,player);
        if(!room){
            return false;
        }
    }
    async joinPrivateGame(player){
        const room = await roomService.createPrivateRoom(player);
        return room;
    }
    async joinGame(player){
        const room = await roomService.findPlayableRoom(player);
        return room;
    }
    async joinGameById(roomId,player){
        let room = await roomService.joinRoomById(roomId,player);
        return room;
        
    }
    async startGame(room){
        const io = getIo();
        let questions = await questionService.getGameQuestions();
        // console.log(questions);
        if(questions == null){
            io.to(room.roomId).emit("error","Error in fetching questions");
            return;
        }
        for(let question of questions){
            io.to(room.roomId).emit("question", question);
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
        io.to(room.roomId).emit("gameOver");
        io.on("endGame",(score) => {
            player1 = room.players[0];
            player2 = room.players[1];
            if(score[player1] > score[player2]){
                room.winner = player1;
                room.winnerScore = score[player1];
            }
            else if(score[player1] < score[player2]){
                room.winner = player2;
                room.winnerScore = score[player2];
            }
            else{
                room.draw = true;
            }
            io.to(room.roomId).emit("gameResult",room);
            roomService.deleteRoom(room.roomId);
            io.to(room.roomId).emit("disconnect");
        })

    }
}
export default GameService;
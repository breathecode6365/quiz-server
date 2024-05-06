import roomDAO from "../model/RoomModel.js";
import QuestionService from "./QuestionService.js";

class RoomService {
  async joinRoomByPrivateId(roomId, player) {
    //find room by roomId which is private and has only one player
    const room = await roomDAO.findOne({
      roomId,
      isPrivate: true,
      players: { $size: 1 },
    });
    if (!room) {
      return false;
    }
    if (room.players.length < 2) {
      room.players.push(player);
      room.save();
      return room;
    } else {
      return false;
    }
  }
  async generateRoomId() {
    this.rooms = await roomDAO.find();
    let roomId;
    do {
      roomId = Math.floor(100000 + Math.random() * 900000);
    } while (this.rooms.find((room) => room.roomId === roomId));
    return roomId.toString();
  }
  async createPrivateRoom(player) {
    const roomId = await this.generateRoomId();
    const room = await roomDAO.create({
      roomId: roomId,
      players: [player],
      questions: await new QuestionService().getGameQuestions(),
      isPrivate: true,
    });
    return room;
  }
  async createRoom(player) {
    const roomId = await this.generateRoomId();
    const room = await roomDAO.create({
      roomId: roomId,
      players: [player],
      questions: await new QuestionService().getGameQuestions(),
      isPrivate: false,
    });
    return room;
  }

  async findPlayableRoom(player) {
    const room = await roomDAO.findOne({
      isPrivate: false,
      players: { $size: 1 },
    });
    if (room !== null) {
      room.players.push(player);
      room.save();
      return room;
    } else {
      return await this.createRoom(player);
    }
  }
  async deleteRoom(roomId) {
    await roomDAO.findOneAndDelete({ roomId });
  }
  async joinRoomById(roomId, player) {
    const room = roomDAO.findOne({ roomId });
    if (!room) {
      return false;
    }
    if (room.players.length < 2) {
      room.players.push(player);
      room.save();
      return room;
    } else {
      return false;
    }
  }
  async getRoomById(roomId) {
    return await roomDAO.findOne({ roomId });
  }
  async exists(roomId) {
    return await roomDAO.exists({ roomId });
  }
  async deleteRoomBySocketId(socketId) {
    const room = await roomDAO.findOne({
      players: { $elemMatch: { playerId: socketId } },
    });
    if (room) {
      await roomDAO.findOneAndDelete({ roomId: room.roomId });
    }
  }
}
export default RoomService;

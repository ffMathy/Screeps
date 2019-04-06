import RoomDecorator from "RoomDecorator";

class Rooms {
  private readonly rooms = {};

  private tickCount: number;

  constructor() {
    this.tickCount = 0;

    for (let key in Game.rooms) {
      this.getCreepRoomDecorator(Game.rooms[key]);
    }
  }

  getMainRoom() {
    for (let key in this.rooms)
      return this.rooms[key];

    console.log('no rooms found');
    return null;
  }

  private getCreepRoomDecorator(room: Room) {
    let roomId = room.name;
    if (this.rooms[roomId])
      return this.rooms[roomId];

    let roomDecorator = new RoomDecorator(room);
    this.rooms[roomId] = roomDecorator;

    return roomDecorator;
  }

  getCreepRoom(creep: Creep) {
    let room = creep.room;
    return this.getCreepRoomDecorator(room);
  }

  refresh() {
  }

  tick() {
    if (this.tickCount++ % 100 === 0) {
      this.refresh();
    }
  }
};

export default new Rooms();

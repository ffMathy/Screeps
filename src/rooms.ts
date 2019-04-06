import RoomDecorator from "RoomDecorator";

class Rooms {
  public readonly roomsByName: { [name: string]: RoomDecorator};
  public readonly mainRoom: RoomDecorator;

  private tickCount: number;

  constructor() {
    this.tickCount = 0;
    this.roomsByName = {};

    for (let key in Game.rooms) {
      let room = Game.rooms[key];

      let decorator = this.getCreepRoomDecorator(room);
      if(room === Game.spawns['Spawn1'].room)
        this.mainRoom = decorator;
    }
  }

  private getCreepRoomDecorator(room: Room) {
    let roomId = room.name;
    if (roomId in this.roomsByName)
      return this.roomsByName[roomId];

    let roomDecorator = new RoomDecorator(room);
    this.roomsByName[roomId] = roomDecorator;

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

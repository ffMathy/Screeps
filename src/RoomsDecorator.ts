import RoomDecorator from "RoomDecorator";
import GameDecorator from "GameDecorator";

export default class RoomsDecorator {
  public readonly byName: { [name: string]: RoomDecorator};
  public readonly all: RoomDecorator[];

  public get rooms() {
    return this.game.game.rooms;
  }

  constructor(private game: GameDecorator) {
    this.byName = {};
    this.all = [];
  }

  initialize() {
    for (let key in this.game.game.rooms) {
      let room = this.game.game.rooms[key];
      this.detectRoom(room.name);
    }

    for(let room of this.all)
      room.detectNeighbours();
  }

  detectRoom(roomName: string) {
    if (roomName in this.byName)
      return this.byName[roomName];

    let roomDecorator = new RoomDecorator(this.game, this, roomName);
    roomDecorator.initialize();

    this.all.push(roomDecorator);
    this.byName[roomName] = roomDecorator;

    return roomDecorator;
  }

  fromCreep(creep: Creep) {
    return this.detectRoom(creep.room.name);
  }

  tick() {
    for(let room of this.all)
      room.tick();
  }
};

import Arrays from "./Arrays";

export default class EventHandler<TOwner, TArguments extends any[]> {
  private readonly listeners: ((owner: TOwner, ...args: TArguments) => void)[];

  constructor(private readonly owner: TOwner) {
    this.listeners = [];
  }

  addListener(listener: (owner: TOwner, ...args: TArguments) => void) {
    Arrays.add(this.listeners, listener);
  }

  removeListener(listener: (owner: TOwner, ...args: TArguments) => void) {
    Arrays.remove(this.listeners, listener);
  }

  fire(...args: TArguments) {
    for(let listener of this.listeners) {
      listener(this.owner, ...args);
    }
  }
}

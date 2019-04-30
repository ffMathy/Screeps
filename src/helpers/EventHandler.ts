import Arrays from "./Arrays";
import DeferHelper from "./DeferHelper";

type EventCallback<TOwner, TArguments extends any[]> = (owner: TOwner, ...args: TArguments) => void;

type EventListener<TOwner, TArguments extends any[]> = {
  callback: EventCallback<TOwner, TArguments>;
  defer: boolean;
}

export default class EventHandler<TOwner = any, TArguments extends any[] = []> {
  private readonly listeners: EventListener<TOwner, TArguments>[];

  constructor(private readonly owner: TOwner) {
    this.listeners = [];
  }

  addListener(listener: EventCallback<TOwner, TArguments>, defer: boolean) {
    Arrays.add(this.listeners, {
      callback: listener,
      defer
    });
  }

  fire(...args: TArguments) {
    for(let listener of this.listeners) {
      if(!listener.defer) {
        listener.callback(this.owner, ...args);
      } else {
        DeferHelper.add(() => listener.callback(this.owner, ...args));
      }
    }
  }
}

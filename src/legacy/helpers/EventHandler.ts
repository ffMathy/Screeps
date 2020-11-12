import Arrays from "./Arrays";
import DeferHelper from "./DeferHelper";

type EventCallback<TOwner, TArguments extends any[]> = (owner: TOwner, ...args: TArguments) => void;

type EventListener<TOwner, TArguments extends any[]> = {
  callback: EventCallback<TOwner, TArguments>;
  defer: boolean;
}

export default class EventHandler<TOwner = any, TArguments extends any[] = []> {
  private readonly listeners: EventListener<TOwner, TArguments>[];

  private currentListener: EventListener<TOwner, TArguments>;

  constructor(private readonly owner: TOwner) {
    this.listeners = [];
    this.currentListener = null;
  }

  addListener(listener: EventCallback<TOwner, TArguments>, defer: boolean) {
    Arrays.add(this.listeners, {
      callback: listener,
      defer
    });
  }

  removeCurrent() {
    Arrays.remove(this.listeners, this.currentListener);
  }

  fire(...args: TArguments) {
    for(let listener of this.listeners) {
      if(!listener.defer) {
        this.currentListener = listener;
        listener.callback(this.owner, ...args);
      } else {
        DeferHelper.add(() => listener.callback(this.owner, ...args));
      }
    }

    this.currentListener = null;
  }
}

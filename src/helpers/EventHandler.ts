import Arrays from "./Arrays";

type EventCallback<TOwner, TArguments extends any[]> = (owner: TOwner, ...args: TArguments) => void;

type EventListener<TOwner, TArguments extends any[]> = {
  callback: EventCallback<TOwner, TArguments>;
  defer: boolean;
}

export default class EventHandler<TOwner = any, TArguments extends any[] = []> {
  private readonly listeners: EventListener<TOwner, TArguments>[];

  private static deferredHandlers = new Array<() => void>();

  constructor(private readonly owner: TOwner) {
    this.listeners = [];
  }

  static runEventHandlers() {
    let handlerCopy = [...this.deferredHandlers];
    this.deferredHandlers.splice(0);

    for(let handler of handlerCopy)
      handler();
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
        Arrays.add(EventHandler.deferredHandlers, () => listener.callback(this.owner, ...args));
      }
    }
  }
}

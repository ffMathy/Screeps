import Arrays from "./Arrays";

export default class DeferHelper {
  private static deferred = new Array<() => void>();

  static run() {
    let handlerCopy = [...this.deferred];
    this.deferred.splice(0);

    for(let handler of handlerCopy)
      handler();
  }

  static add(item: () => void) {
    return Arrays.add(this.deferred, item);
  }
}

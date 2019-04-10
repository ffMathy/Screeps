export default class Arrays {
  static add<T>(array: T[], item: T) {
    if(array.indexOf(item) > -1)
      return;

    array.push(item);
  }

  static remove<T>(array: T[], item: T) {
    if(array.indexOf(item) === -1)
      return;

    array.splice(array.indexOf(item), 1);
  }
}

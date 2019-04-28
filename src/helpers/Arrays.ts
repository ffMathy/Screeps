export default class Arrays {
  static add<T>(array: T[], item: T) {
    if(!item)
      return false;

    if(array.indexOf(item) > -1)
      return false;

    array.push(item);
    return true;
  }

  static remove<T>(array: T[], item: T) {
    if(!item)
      return false;

    if(array.indexOf(item) === -1)
      return false;

    array.splice(array.indexOf(item), 1);

    return true;
  }
}

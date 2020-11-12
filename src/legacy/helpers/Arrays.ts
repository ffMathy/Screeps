export default class Arrays {
  static add<T>(array: T[], item: T) {
    if(!item)
      return false;

    if(array.indexOf(item) > -1)
      return false;

    array.push(item);
    return true;
  }

  static removeFromMultiple<T>(item: T, ...arrays: T[][]) {
    for(let array of arrays)
      Arrays.remove(array, item);
  }

  static addToMultiple<T>(item: T, ...arrays: T[][]) {
    for(let array of arrays)
      Arrays.add(array, item);
  }

  static insertAscending<T>(array: T[], item: T, scoreAccessor: (item: T) => number) {
    let itemScore = scoreAccessor(item);
    for(let i=0;i<array.length;i++) {
      let arrayItem = array[i];
      if(arrayItem === item)
        return false;

      let arrayItemScore = scoreAccessor(arrayItem);
      if(arrayItemScore <= itemScore)
        continue;

      array.splice(i, 0, item);
      return true;
    }

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

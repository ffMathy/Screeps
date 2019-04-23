export default class Coordinates {
  static calculateSpiralOffset(offset: number) {
    var r = Math.floor((Math.sqrt(offset + 1) - 1) / 2) + 1;
    var p = (8 * r * (r - 1)) / 2;
    var en = r * 2;
    var a = (1 + offset - p) % (r * 8);

    var pos = [0, 0, r];
    switch (Math.floor(a / (r * 2))) {
        case 0:
            {
                pos[0] = a - r;
                pos[1] = -r;
            }
            break;
        case 1:
            {
                pos[0] = r;
                pos[1] = (a % en) - r;

            }
            break;
        case 2:
            {
                pos[0] = r - (a % en);
                pos[1] = r;
            }
            break;
        case 3:
            {
                pos[0] = -r;
                pos[1] = r - (a % en);
            }
            break;
    }
    return { x: pos[0], y: pos[1] };
  }
}

export default interface Strategy {
  readonly name: string;

  tick();
}

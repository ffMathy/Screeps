import CreepDecorator from "CreepDecorator";

export interface Strategy {
  readonly name: string;

  tick();
}

export interface CreepStrategy {
  readonly name: string;

  tick(): ((creep: CreepDecorator) => CreepStrategy)|CreepStrategy|null|void;
}

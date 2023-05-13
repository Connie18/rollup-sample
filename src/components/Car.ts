import { Vehicle } from "./Vehicle";

export class Car extends Vehicle {
  constructor(color: string, public model: string) {
    super(color);
  }

  describe() {
    return `This car is a ${this.color} ${this.model}`;
  }
}

import { Vehicle } from "./Vehicle";

export class Person {
  vehicle: Vehicle;

  constructor(public name: string, vehicle: Vehicle) {
    this.vehicle = vehicle;
  }

  greet() {
    return `Hello, my name is ${
      this.name
    } and I have a ${this.vehicle.describe()}`;
  }
}

export class Vehicle {
  constructor(public color: string) {}

  describe() {
    return `This vehicle is ${this.color}`;
  }
}

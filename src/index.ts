import { Person } from "./components/Person";
import { Car } from "./components/Car";

const johnsCar = new Car("red", "Toyota");
const john = new Person("John", johnsCar);
console.log(john.greet());

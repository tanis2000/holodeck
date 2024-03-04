import { Display } from "rot-js";

export abstract class BaseScreen {
    constructor(public display: Display) {
    }

    abstract render(): void;

    abstract update(event: KeyboardEvent): void;
}
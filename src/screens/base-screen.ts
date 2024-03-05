import { Display } from "rot-js";
import { BaseInputHandler } from "../input-handler";

export abstract class BaseScreen {
    abstract inputHandler: BaseInputHandler | null;

    constructor(public display: Display) {
    }

    abstract render(): void;

    abstract update(event: KeyboardEvent): void;
}
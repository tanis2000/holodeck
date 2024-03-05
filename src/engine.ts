import * as rot from 'rot-js'
import { BaseScreen } from './screens/base-screen'
import { MainMenu } from './screens/main-menu'
import { Actor } from './entity'

export class Engine {
    public static readonly WIDTH = 80
    public static readonly HEIGHT = 50
    public static readonly MAP_WIDTH = 80
    public static readonly MAP_HEIGHT = 43

    display: rot.Display
    screen: BaseScreen
    player: Actor | null = null

    constructor() {
        this.display = new rot.Display({
            width: Engine.WIDTH,
            height: Engine.HEIGHT,
            forceSquareRatio: true,
        })

        const container = this.display.getContainer()!
        document.body.appendChild(container)

        this.screen = new MainMenu(this.display)

        window.addEventListener('keydown', (event) => {
            this.update(event);
        });

        window.addEventListener('mousemove', (event) => {
            if (this.screen.inputHandler) {
                this.screen.inputHandler.handleMouseMovement(
                    this.display.eventToPosition(event),
                );
            }
        });

    }

    update(event: KeyboardEvent) {
        this.screen.update(event);
    }

    render() {
        this.screen.render();
    }

    run() {
        this.render();
    }

    nextScreen(screenToRun: BaseScreen) {
        this.screen = screenToRun
    }

}
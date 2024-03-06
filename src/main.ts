import './style.css'
import { Engine } from './engine.ts'
import { MessageLog } from './message-log.ts'

declare global {
  interface Window {
    engine: Engine
    messageLog: MessageLog
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.messageLog = new MessageLog()
  window.messageLog.addMessage('I am your HoloDeck. Welcome to your first mission. Press ? to see the list of commands.')
  window.engine = new Engine()
  startAnimating(60);
})

let fpsInterval: number
let now: number
let then: number
let elapsed: number

function startAnimating(fps: number) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  animate();
}

function animate() {
  window.requestAnimationFrame(animate);

  now = Date.now();
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame

  if (elapsed > fpsInterval) {

    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
    then = now - (elapsed % fpsInterval);

    window.engine.run();
  }

}
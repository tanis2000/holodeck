import { Display } from "rot-js";
import { Colors } from "./colors";
import { GameMap } from "./game-map";

export function renderFrameWithTitle(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
) {
    const topLeft = '┌';
    const topRight = '┐';
    const bottomLeft = '└';
    const bottomRight = '┘';
    const vertical = '│';
    const horizontal = '─';
    const leftTitle = '┤';
    const rightTitle = '├';
    const empty = ' ';

    const innerWidth = width - 2;
    const innerHeight = height - 2;
    const remainingAfterTitle = innerWidth - (title.length + 2); // adding two because of the borders on left and right
    const left = Math.floor(remainingAfterTitle / 2);

    const topRow =
        topLeft +
        horizontal.repeat(left) +
        leftTitle +
        title +
        rightTitle +
        horizontal.repeat(remainingAfterTitle - left) +
        topRight;
    const middleRow = vertical + empty.repeat(innerWidth) + vertical;
    const bottomRow = bottomLeft + horizontal.repeat(innerWidth) + bottomRight;

    window.engine.display.drawText(x, y, topRow);
    for (let i = 1; i <= innerHeight; i++) {
        window.engine.display.drawText(x, y + i, middleRow);
    }
    window.engine.display.drawText(x, y + height - 1, bottomRow);
}

function drawColoredBar(
    display: Display,
    x: number,
    y: number,
    width: number,
    color: Colors,
) {
    for (let pos = x; pos < x + width; pos++) {
        display.draw(pos, y, ' ', color, color);
    }
}

export function renderHealthBar(
    display: Display,
    currentValue: number,
    maxValue: number,
    totalWidth: number,
) {
    const barWidth = Math.floor((currentValue / maxValue) * totalWidth);

    drawColoredBar(display, 0, 45, totalWidth, Colors.HealthBarEmpty);
    drawColoredBar(display, 0, 45, barWidth, Colors.HealthBarFilled);

    const healthText = `HP: ${currentValue}/${maxValue}`;

    for (let i = 0; i < healthText.length; i++) {
        display.drawOver(i + 1, 45, healthText[i], Colors.HealthBarText, null);
    }
}

export function renderAlarmBar(
    display: Display,
    currentValue: number,
    maxValue: number,
    totalWidth: number,
) {
    const barWidth = Math.floor((currentValue / maxValue) * totalWidth);

    drawColoredBar(display, 0, 46, totalWidth, Colors.AlarmBarEmpty);
    drawColoredBar(display, 0, 46, barWidth, Colors.AlarmBarFilled);

    const healthText = `Alarm level: ${currentValue}/${maxValue}`;

    for (let i = 0; i < healthText.length; i++) {
        display.drawOver(i + 1, 46, healthText[i], Colors.AlarmBarText, null);
    }
}

export function renderPowerBar(
    display: Display,
    currentValue: number,
    totalWidth: number,
) {
    const barWidth = totalWidth;

    drawColoredBar(display, 0, 47, totalWidth, Colors.PowerBarEmpty);
    drawColoredBar(display, 0, 47, barWidth, Colors.PowerBarFilled);

    const healthText = `Power: ${currentValue}`;

    for (let i = 0; i < healthText.length; i++) {
        display.drawOver(i + 1, 47, healthText[i], Colors.PowerBarText, null);
    }
}

export function renderDefenseBar(
    display: Display,
    currentValue: number,
    totalWidth: number,
) {
    const barWidth = totalWidth;

    drawColoredBar(display, 0, 48, totalWidth, Colors.DefenseBarEmpty);
    drawColoredBar(display, 0, 48, barWidth, Colors.DefenseBarFilled);

    const healthText = `Defense: ${currentValue}`;

    for (let i = 0; i < healthText.length; i++) {
        display.drawOver(i + 1, 48, healthText[i], Colors.DefenseBarText, null);
    }
}

export function renderPlayerLevelBar(
    display: Display,
    currentValue: number,
    totalWidth: number,
) {
    const barWidth = totalWidth;

    drawColoredBar(display, 0, 49, totalWidth, Colors.PlayerLevelBarEmpty);
    drawColoredBar(display, 0, 49, barWidth, Colors.PlayerLevelBarFilled);

    const healthText = `Player level: ${currentValue}`;

    for (let i = 0; i < healthText.length; i++) {
        display.drawOver(i + 1, 49, healthText[i], Colors.PlayerLevelBarText, null);
    }
}

export function renderNamesAtLocation(
    x: number,
    y: number,
    mousePosition: [number, number],
    gameMap: GameMap
) {
    const [mouseX, mouseY] = mousePosition;
    if (
        gameMap.isInBounds(mouseX, mouseY) &&
        gameMap.tileIsVisible(mouseX, mouseY)
    ) {
        const names = gameMap.entities
            .filter((e) => e.x === mouseX && e.y === mouseY)
            .map((e) => e.name.charAt(0).toUpperCase() + e.name.substring(1))
            .join(', ');

        window.engine.display.drawText(x, y, names);
    }
}

export function renderXpBar(
    display: Display,
    currentValue: number,
    maxValue: number,
    totalWidth: number,
) {
    const barWidth = Math.floor((currentValue / maxValue) * totalWidth);

    drawColoredBar(display, 60, 45, totalWidth, Colors.XpBarEmpty);
    drawColoredBar(display, 60, 45, barWidth, Colors.XpBarFilled);

    const healthText = `XP: ${currentValue}/${maxValue}`;

    for (let i = 0; i < healthText.length; i++) {
        display.drawOver(60 + i + 1, 45, healthText[i], Colors.XpBarText, null);
    }
}

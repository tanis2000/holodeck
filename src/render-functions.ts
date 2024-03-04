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
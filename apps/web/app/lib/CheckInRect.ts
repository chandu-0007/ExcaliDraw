import type { DrawRectType } from "@repo/common";
export const CheckInRect = (element: DrawRectType, x: number, y: number) => {
    const minX = Math.min(element.Startx, element.endX);
    const maxX = Math.max(element.Startx, element.endX);
    const minY = Math.min(element.Starty, element.endY);
    const maxY = Math.max(element.Starty, element.endY);
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) return true;
    return false;

}
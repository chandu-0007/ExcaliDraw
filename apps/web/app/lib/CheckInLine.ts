import type { DrawLineType } from "@repo/common"

export const CheckInLine = (
  element: DrawLineType,
  x: number,
  y: number
) => {

  const x1 = element.Startx;
  const y1 = element.Starty;

  const x2 = element.endX;
  const y2 = element.endY;

  const A = x - x1;
  const B = y - y1;

  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy) < 5;
}
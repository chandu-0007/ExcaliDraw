import { DrawCircle } from "@repo/common";

export function CheckInCircle(
  element: DrawCircle,
  x: number,
  y: number
) {
  const distanceSquared =
    Math.pow(x - element.centerX, 2) +
    Math.pow(y - element.centerY, 2);

  return distanceSquared <= element.radius * element.radius;
}
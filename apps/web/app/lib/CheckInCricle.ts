import { DrawCircle } from "@repo/common";

export function CheckInCircle(
  element: DrawCircle,
  x: number,
  y: number
) {
  const distanceSquared =
    Math.pow(x - element.centerX, 2) +
    Math.pow(y - element.centerY, 2);

  const radiusSquared = Math.pow(element.radius, 2);

  const tolerance = 5; // pixels

  return (
    Math.abs(Math.sqrt(distanceSquared) - element.radius) <= tolerance
  );
}
import type { ElementsType } from "@repo/common";

export const CheckInText = (
  element: Extract<ElementsType, { type: "text" }>,
  x: number,
  y: number
): boolean => {
  // Create an offscreen canvas just to measure text width
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  ctx.font = `${element.fontSize}px 'Caveat', cursive`;

  const lines = element.text.split("\n");
  const lineHeight = element.fontSize * 1.2;

  // Check each line as a separate bounding box
  for (let i = 0; i < lines.length; i++) {
    const metrics = ctx.measureText(lines[i]!);
    const lineWidth = metrics.width;
    const lineTop = element.y + i * lineHeight;
    const lineBottom = lineTop + element.fontSize;

    if (
      x >= element.x &&
      x <= element.x + lineWidth &&
      y >= lineTop &&
      y <= lineBottom
    ) {
      return true;
    }
  }

  return false;
};
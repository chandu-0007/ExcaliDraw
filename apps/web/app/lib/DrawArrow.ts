export default function DrawArrow(
  ctx: CanvasRenderingContext2D | null | undefined,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  strokeWidth: number
) {
  if (!ctx) return;
 if(startX  == endX || startY == endY) return ; 
  ctx.beginPath(); // IMPORTANT

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;

  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  const headlen = 15;
  const angle = Math.atan2(endY - startY, endX - startX);

  ctx.beginPath(); 

  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headlen * Math.cos(angle - Math.PI / 6),
    endY - headlen * Math.sin(angle - Math.PI / 6)
  );

  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headlen * Math.cos(angle + Math.PI / 6),
    endY - headlen * Math.sin(angle + Math.PI / 6)
  );

  ctx.stroke();
}


export function drawCircle(ctx : CanvasRenderingContext2D | null | undefined, x : number, y : number, radius : number 
    , fill : string , stroke : string , strokeWidth : number) {
        if(ctx == null || ctx == undefined) return ; 
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false) ;
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

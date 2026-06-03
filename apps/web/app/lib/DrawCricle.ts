

export function drawCircle(ctx : CanvasRenderingContext2D | null | undefined, x : number, y : number, radius : number 
    , Color : string , strokColor : string , strokWidth : number) {
        if(ctx == null || ctx == undefined) return ; 
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false) ;
    ctx.fillStyle = Color
    ctx.fill()
    ctx.lineWidth = strokWidth
    ctx.strokeStyle = strokColor
    ctx.stroke()
}

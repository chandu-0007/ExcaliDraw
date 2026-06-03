export const Rectangle = (ctx : CanvasRenderingContext2D | null | undefined,
     oldx : number , oldy  : number , newx :  number , newy : number   , isDrawing : boolean 
     , color : string , strokColor : string ,  strokeWidth : number )=>{
    if(ctx == null || ctx == undefined || !isDrawing) return ; 
    ctx.fillStyle = color ; 
    let w= newx - oldx ; 
    let h = newy - oldy ; 
    ctx.fillRect(oldx ,oldy ,w ,h) ; 
    ctx.strokeStyle = strokColor; 
    ctx.lineWidth = strokeWidth ; 
    ctx.strokeRect(oldx , oldy , w , h) ; 
    return ; 
}
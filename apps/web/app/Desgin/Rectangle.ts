export const Rectangle = (ctx : CanvasRenderingContext2D | null | undefined,
     oldx : number , oldy  : number , newx :  number , newy : number   , isDrawing : boolean , color : string )=>{
    if(ctx == null || ctx == undefined || !isDrawing) return ; 
    ctx.strokeStyle = color ; 
    let w= newx - oldx ; 
    let h = newy - oldy ; 
    ctx.strokeRect(oldx ,oldy ,w ,h) ; 
    return ; 
}
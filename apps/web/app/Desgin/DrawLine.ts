export default  function DrawLIne(ctx : CanvasRenderingContext2D | null | undefined ,oldx: number , oldy : number , newx : number , newy :number  , isDrawing : boolean , color : string){
    if(ctx == null || ctx == undefined || !isDrawing){
        return ; 
    }
    ctx.strokeStyle = color ; 
    ctx.beginPath(); 
    ctx.moveTo(oldx ,oldy);
    ctx.lineTo(newx,newy) ; 
    ctx.stroke() ; 
    return ;  
}
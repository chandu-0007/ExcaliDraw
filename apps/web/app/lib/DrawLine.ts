export const  DrawLine = (ctx : CanvasRenderingContext2D | null | undefined ,oldx: number , oldy : number , newx : number , newy :number  , color : string , StrokWidth : number) => {
    if(ctx == null || ctx == undefined){
        return ; 
    }
    ctx.strokeStyle = color ; 
    ctx.beginPath(); 
    ctx.moveTo(oldx ,oldy);
    ctx.lineTo(newx,newy) ; 
    ctx.stroke() ; 
    ctx.lineWidth = StrokWidth ;
    return ;  
}
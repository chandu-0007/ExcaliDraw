

export function findDistance(x1 : number , y1 : number , x2 : number , y2 : number){
   let x = x2 - x1 ; 
   let y = y2 - y1 ; 
   return Math.sqrt(x*x + y*y) ;

}
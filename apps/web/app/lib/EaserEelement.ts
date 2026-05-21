
import type { ElementsType } from "@repo/common"
const EarseElement = (elements : ElementsType[], id : string )=>{
     return elements.filter(ele => ele.id != id) ; 
}

export default EarseElement ; 
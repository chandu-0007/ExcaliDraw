import axios from "axios"
import { cookies } from "next/headers";
export  const POST = async (req :Request  )=>{
    const token = (await cookies()).get("token")?.value;
    const body = await req.json()
  const response = await axios.post(
    "http://localhost:3003/ai-diagram", body , 
    {    
     headers: {
        Cookie: `token=${token}`,
      } 
    }
  );
  
  return Response.json(response.data);

}
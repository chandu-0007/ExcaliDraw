import { cookies } from "next/headers";
import axios from "axios";

export async function GET() {

  const token = (await cookies()).get("token")?.value;

  const response = await axios.get(
    "http://backend:3003/profile",
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  );

  return Response.json(response.data);
}
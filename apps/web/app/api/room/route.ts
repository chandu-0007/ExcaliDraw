// app/api/room/route.ts

import { cookies } from "next/headers";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();
  console.log(body);
  const token = (await cookies()).get("token")?.value;
  const response = await axios.post(
    "http://localhost:3003/room",
    body,
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  );

  return Response.json(response.data);
}
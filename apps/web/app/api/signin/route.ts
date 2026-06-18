import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Call Express backend
    const backendRes = await axios.post(
      "http://backend:3003/signin",
      body
    );

    const data = backendRes.data;

    const response = NextResponse.json({
      message: "Login successful",
      username: data.username,
      id:data.id
    });

    //  Set cookie here
    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: false, // local
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        message: err.response?.data?.message || "Login failed",
      },
      { status: err.response?.status || 500 }
    );
  }
}
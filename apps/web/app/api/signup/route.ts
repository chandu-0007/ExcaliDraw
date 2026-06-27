import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    
    const backendRes = await axios.post(
      "http://backend:3003/signup",
      body
    );

    const data = backendRes.data;

    const response = NextResponse.json({
      message: "Signup successful",
      username: data.username,
      id : data.id 
    });

    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        message: err.response?.data?.message || "Signup failed",
      },
      { status: err.response?.status || 500 }
    );
  }
}
// app/layout.tsx

import { SocketProvider } from "../Context-API/UseSocket";
import { cookies } from "next/headers";
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if(!token) return null ; 
  return (
        <SocketProvider token={token}>
          {children}
        </SocketProvider>
  );
}
// app/layout.tsx

import { SocketProvider } from "../Context-API/UseSocket";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <SocketProvider>
          {children}
        </SocketProvider>
  );
}
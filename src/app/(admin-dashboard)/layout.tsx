// app/layout.tsx

import type { ReactNode } from "react";
import "../globals.css"; // ✅ Relative path to global CSS
import ClientLayout from "@/components/ClientLayout";


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

import { ReactNode } from "react";
import { Providers } from "@/components/Providers";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default Layout;

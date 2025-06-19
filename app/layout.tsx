import type { Metadata } from "next";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Renko - Your Personal AI Coach",
  description: "Your Personal AI Coach",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider apiRoute="/api/auth" storage="localStorage">
      <html lang="en">
        <body className="antialiased font-sans" suppressHydrationWarning>
          <ConvexClientProvider>
            <AppLayout>{children}</AppLayout>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

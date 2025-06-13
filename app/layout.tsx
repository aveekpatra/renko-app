import type { Metadata } from "next";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Productivity - All-in-One Task Manager",
  description: "Manage your tasks, projects, calendar, and habits in one place",
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
    <ConvexAuthNextjsServerProvider>
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

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "WebChat",
  description: "A real-time messaging application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

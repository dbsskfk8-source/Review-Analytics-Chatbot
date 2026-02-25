import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewAI - Shopping Review Analytics Chatbot",
  description: "AI-powered shopping review analytics chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}

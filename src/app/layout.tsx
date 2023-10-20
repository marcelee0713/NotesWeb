import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Noted",
  description: "Maybe try noting your plans for the weekend?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-screen max-w-full">
      <body className={`${roboto.className} w-full h-full bg-slate-900`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}

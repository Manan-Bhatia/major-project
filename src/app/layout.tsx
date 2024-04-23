import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "ResultLy",
    description: "ResultLy: Result Management System",
};

declare global {
    interface Window {
        electronAPI: {
            on: (event: string, callback: (...args: any[]) => void) => void;
            send: (channel: string, args: any) => void;
            receiveTokenFromMain: (callback: (...args: any[]) => void) => void;
            loggedIn: (callback: (...args: any[]) => void) => void;
            OpenFile: () => void;
        };
    }
}
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    inter.variable
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

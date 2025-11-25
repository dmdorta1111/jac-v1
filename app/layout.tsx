import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { ModelModalProvider } from "@/components/providers/model-modal-provider";
import { WorkflowModalProvider } from "@/components/providers/workflow-modal-provider";
import { ModelViewerModal } from "@/components/model-viewer-modal";
import { WorkflowViewerModal } from "@/components/workflow-viewer-modal";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EMJAC AI Assistant | Custom Stainless Steel Fabrication",
  description:
    "AI-powered engineering assistant for EMJAC's custom commercial kitchen equipment, doors, frames, and wine coolers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0a0f1a] font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="emjac-theme">
          <SidebarProvider>
            <ModelModalProvider>
              <WorkflowModalProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1 pb-20">{children}</main>
                  <Footer />
                </div>
                {/* Modals rendered at root level */}
                <ModelViewerModal />
                <WorkflowViewerModal />
              </WorkflowModalProvider>
            </ModelModalProvider>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster position="top-left" />
      </body>     
    </html>
  );
}

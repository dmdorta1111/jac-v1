import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { ModelModalProvider } from "@/components/providers/model-modal-provider";
import { WorkflowModalProvider } from "@/components/providers/workflow-modal-provider";
import { StdsModalProvider } from "@/components/providers/stds-modal-provider";
import { ProjectProvider } from "@/components/providers/project-context";
import { StandardsProvider } from "@/components/providers/standards-provider";
import { ModelViewerModal } from "@/components/model-viewer-modal";
import { StdsFormModal } from "@/components/stds-form-modal";
import { Header } from "@/components/header";
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
  title: "JAC AI Assistant | Custom Stainless Steel Fabrication",
  description:
    "AI-powered engineering assistant for JAC's custom commercial kitchen equipment, doors, frames, and wine coolers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen min-h-screen font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="emjac-theme">
          <SidebarProvider>
            <ProjectProvider>
              <StandardsProvider>
                <ModelModalProvider>
                  <StdsModalProvider>
                    <WorkflowModalProvider>
                      <div className="relative flex min-h-screen w-full flex-col overflow-visible">
                        <Header />
                        <main className="flex-1 w-full overflow-y-auto scrollbar-hide pb-20">{children}</main>
                      </div>
                      {/* Modals rendered at root level */}
                      <ModelViewerModal />
                      <StdsFormModal />
                    </WorkflowModalProvider>
                  </StdsModalProvider>
                </ModelModalProvider>
              </StandardsProvider>
            </ProjectProvider>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster position="top-left" />
      </body>
    </html>
  );
}

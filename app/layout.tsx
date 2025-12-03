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
import Image from "next/image";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Disable transitions during initial load to prevent flash
                document.documentElement.style.setProperty('--initial-load', '1');
                const stored = localStorage.getItem('emjac-theme');
                const theme = stored || 'dark';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
                // Re-enable transitions after paint
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    document.documentElement.style.removeProperty('--initial-load');
                  });
                });
              })();
            `,
          }}
        />
      </head>
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
                        <main className="flex-1 w-full overflow-y-auto scrollbar-hide">{children}</main>
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
        {/* Steel texture with 3D depth effect */}
        <div className="absolute inset-0 -z-10">
          {/* Base steel texture */}
          <Image
            src="/METAL_SHEET_02.png"
            alt="Metal Sheet"
            fill
            className="object-cover opacity-40 dark:opacity-50"
          />
          {/* Depth gradient overlay - creates 3D recessed effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 dark:from-black/30 dark:via-transparent dark:to-black/40" />
          {/* Vignette for depth around edges */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(0,0,0,0.3)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
          {/* Subtle inner shadow from top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/15 to-transparent dark:from-black/25" />
        </div>
        </ThemeProvider>
        <Toaster position="top-left" />
      </body>
    </html>
  );
}

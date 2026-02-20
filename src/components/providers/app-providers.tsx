"use client";

import { CampusProvider } from "@/components/providers/campus-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaRegistration } from "@/components/pwa/registration";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CampusProvider>
        <PwaRegistration />
        {children}
      </CampusProvider>
    </ThemeProvider>
  );
}

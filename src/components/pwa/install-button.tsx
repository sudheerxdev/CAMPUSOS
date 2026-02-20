"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (isInstalled) {
    return (
      <Button variant="glass" className={className} disabled>
        Installed
      </Button>
    );
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("Open browser menu and choose 'Install app' or 'Add to Home Screen'.");
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
  };

  return (
    <Button onClick={handleInstall} variant="glass" className={className}>
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
}

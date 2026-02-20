import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = getBaseUrl();
  return {
    name: "CAMPUSOS - The Operating System for Students",
    short_name: "CAMPUSOS",
    description:
      "All-in-one productivity and placement super-app for college students.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    orientation: "portrait",
    scope: "/",
    id: "/",
    categories: ["education", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: `${baseUrl}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}

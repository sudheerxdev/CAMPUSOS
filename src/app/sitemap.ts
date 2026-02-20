import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

const routes = [
  "",
  "/app",
  "/app/study-planner",
  "/app/focus",
  "/app/exams",
  "/app/cgpa",
  "/app/placement",
  "/app/coding",
  "/app/company-kits",
  "/app/resume",
  "/app/notes",
  "/app/resources",
  "/app/goals",
  "/app/settings",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.8,
  }));
}

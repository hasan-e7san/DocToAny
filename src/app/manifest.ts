import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DocToObject",
    short_name: "DocToObject",
    description:
      "AI-powered document processing SaaS for converting PDF, DOCX, and XLSX into structured output formats.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons8-document-250.png",
        sizes: "250x250",
        type: "image/png",
      },
    ],
  };
}

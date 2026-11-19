import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lav Crochets",
    short_name: "Lav Crochets",
    description: "Handmade crochet charms, hair accessories and keychains, made with love.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7F0",
    theme_color: "#8E6FB3",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

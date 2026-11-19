"use client";
// use-image-fade.js — fade an image in once it arrives, without ever hiding
// one that is already there. An image counts as "loading" only if it is
// still incomplete when React attaches to it; server HTML, cached images and
// anything loaded before hydration show immediately. Styles: .img-fade
// (styles/utilities.css).
import { useCallback, useState } from "react";

export function useImageFade() {
  const [loading, setLoading] = useState(false);
  const ref = useCallback((img) => {
    if (img && !img.complete) setLoading(true);
  }, []);
  const done = useCallback(() => setLoading(false), []);
  return { ref, done, className: loading ? "img-fade is-loading" : "img-fade" };
}

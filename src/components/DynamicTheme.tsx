"use client";

import { useEffect } from "react";
import { useStore } from "@/context/StoreContext";

export default function DynamicTheme() {
  const { theme } = useStore();

  useEffect(() => {
    if (!theme) return;

    const primary = theme.primaryColor || "#4B291B";
    const secondary = theme.secondaryColor || "#A9683B";
    const bg = theme.backgroundColor || "#FAF5EF";
    const surface = theme.surfaceColor || "#FFFDF9";
    const accent = theme.accentColor || "#EBD9C7";
    const text = theme.textColor || "#211A16";

    // Set CSS properties on root element
    const root = document.documentElement;
    root.style.setProperty("--color-primary", primary);
    root.style.setProperty("--color-secondary", secondary);
    root.style.setProperty("--color-bg", bg);
    root.style.setProperty("--color-surface", surface);
    root.style.setProperty("--color-accent", accent);
    root.style.setProperty("--color-text", text);

    let styleEl = document.getElementById("dapur-rasa-dynamic-theme-style") as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dapur-rasa-dynamic-theme-style";
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      :root {
        --color-primary: ${primary};
        --color-secondary: ${secondary};
        --color-bg: ${bg};
        --color-surface: ${surface};
        --color-accent: ${accent};
        --color-text: ${text};
      }

      /* Global Background Overrides (Enforces the chosen background on the whole web) */
      html,
      body,
      main,
      #main-content,
      .bg-theme-bg,
      .bg-gray-50,
      .bg-gray-50\\/40,
      .bg-gray-50\\/50,
      .bg-slate-50,
      .bg-stone-50,
      .bg-white\\/90 {
        background-color: ${bg} !important;
        color: ${text} !important;
      }

      /* Primary Background Overrides (Buttons, Badges, Banners, Logo) */
      .bg-\\[\\#4A0E4E\\],
      .bg-\\[\\#4B291B\\],
      .bg-theme-primary {
        background-color: ${primary} !important;
      }

      /* Primary Text Overrides (Brand, Headings, Price, Icons) */
      .text-\\[\\#4A0E4E\\],
      .text-\\[\\#4B291B\\],
      .text-theme-primary {
        color: ${primary} !important;
      }

      /* Primary Border Overrides */
      .border-\\[\\#4A0E4E\\],
      .border-\\[\\#4B291B\\],
      .border-theme-primary {
        border-color: ${primary} !important;
      }

      /* Hover States */
      .hover\\:bg-\\[\\#5C1261\\]:hover,
      .hover\\:bg-\\[\\#4A0E4E\\]:hover,
      .hover\\:bg-\\[\\#3A1F14\\]:hover,
      .hover\\:bg-theme-primary:hover {
        filter: brightness(0.88) !important;
      }

      .hover\\:text-\\[\\#4A0E4E\\]:hover,
      .hover\\:text-\\[\\#4B291B\\]:hover,
      .group:hover .group-hover\\:text-\\[\\#4A0E4E\\],
      .group:hover .group-hover\\:text-\\[\\#4B291B\\] {
        color: ${primary} !important;
        filter: brightness(0.85);
      }

      /* Translucent / Soft Badges */
      .bg-\\[\\#4A0E4E\\]\\/10,
      .bg-\\[\\#4B291B\\]\\/10 {
        background-color: color-mix(in srgb, ${primary} 12%, transparent) !important;
      }

      .bg-\\[\\#4A0E4E\\]\\/5,
      .bg-\\[\\#4B291B\\]\\/5 {
        background-color: color-mix(in srgb, ${primary} 6%, transparent) !important;
      }

      .border-\\[\\#4A0E4E\\]\\/40,
      .border-\\[\\#4A0E4E\\]\\/50 {
        border-color: color-mix(in srgb, ${primary} 40%, transparent) !important;
      }

      .group:hover .group-hover\\:border-\\[\\#4A0E4E\\]\\/40,
      .group:hover .group-hover\\:border-\\[\\#4B291B\\]\\/40 {
        border-color: color-mix(in srgb, ${primary} 40%, transparent) !important;
      }

      /* Secondary & Surface Colors */
      .bg-theme-secondary,
      .bg-\\[\\#A9683B\\],
      .bg-\\[\\#4B95FF\\] {
        background-color: ${secondary} !important;
      }

      .text-theme-secondary,
      .text-\\[\\#A9683B\\],
      .text-\\[\\#4B95FF\\] {
        color: ${secondary} !important;
      }

      .bg-theme-surface {
        background-color: ${surface} !important;
      }

      .bg-theme-accent,
      .bg-\\[\\#FAF5FF\\],
      .bg-\\[\\#EBD9C7\\] {
        background-color: ${accent} !important;
      }
    `;
  }, [theme]);

  return null;
}

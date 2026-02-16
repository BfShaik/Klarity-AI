import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Safelist dynamic classes so they are never purged (avoids intermittent missing styles)
  safelist: [
    "btn-primary",
    "btn-secondary",
    "btn-danger",
    "page-bg",
    "card-bg",
    "input-dark",
    "bg-green-100",
    "text-green-800",
    "bg-gray-100",
    "text-gray-600",
    "bg-blue-100",
    "text-blue-800",
    "bg-gray-200",
    "text-gray-700",
    "hover:bg-gray-300",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

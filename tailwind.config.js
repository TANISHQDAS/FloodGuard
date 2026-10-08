/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        navy: {
          900: "#0b1329",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
        },
        flood: {
          normal: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          rapid: "#f97316",
        }
      },
    },
  },
  plugins: [],
};

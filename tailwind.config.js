/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          primary: "#000000",
          secondary: "#0a0a0a",
          tertiary: "#141414",
          dark: "#000000",
          accent: "#3b82f6",
          accentHover: "#2563eb",
          textPrimary: "#f5f5f5",
          textSecondary: "#a1a1aa",
          online: "#10b981",
          idle: "#f59e0b",
          dnd: "#ef4444",
          offline: "#71717a",
        },
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px",
      },
    },
  },
  plugins: [],
};

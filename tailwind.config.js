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
          primary: "#36393F",
          secondary: "#2F3136",
          tertiary: "#282C34",
          dark: "#202225",
          accent: "#5B65F5",
          accentHover: "#4752C4",
          textPrimary: "#DCDDDE",
          textSecondary: "#72767D",
          online: "#43B581",
          idle: "#FAA61A",
          dnd: "#F04747",
          offline: "#747F8D",
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

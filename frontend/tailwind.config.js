/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Calming clinical palette, grounded in evidence based healthcare
           design research: cool blue greens reduce patient anxiety and stress,
           nature inspired greens read as healing, warm neutrals replace
           sterile whites (which research links to higher stress), and a
           softened clay carries urgency for critical states without the
           overstimulation of alarm red. */
        mist: {
          50: "#F6FAFB", // page background, soft blue mist
          100: "#EFF4F6",
          200: "#E2EBEF",
        },
        teal: {
          50: "#EDF6F8",
          100: "#D9EAF0", // light tint
          500: "#3F8EA1",
          600: "#2F7E8F", // primary, dusty teal
          700: "#276B7A", // primary hover
        },
        sage: {
          100: "#E4EEE3", // light tint
          500: "#7A9B7E", // healing green
          600: "#678A6C",
        },
        clay: {
          100: "#F6E3DD", // light tint
          500: "#C26D5B", // softened terracotta, urgent but not alarming
          600: "#A95946",
        },
        stone: {
          100: "#E9ECEE",
          500: "#9AA3A8", // warm gray
        },
        ink: {
          500: "#5B6B76",
          700: "#3A4750",
          900: "#2C3A44", // body text
        },
        sand: "#EFE7D7", // warm neutral accent
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        risk: {
          low: "#22c55e",
          moderate: "#eab308",
          high: "#f97316",
          "very-high": "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
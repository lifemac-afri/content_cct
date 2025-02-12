/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary_green: "#85C323",
        dark_green: "#85A123",
        primary_gray: "#373D4B",
      },
    },
  },
  plugins: [],
};

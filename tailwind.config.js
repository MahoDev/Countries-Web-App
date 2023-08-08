/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./src/scripts/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        "2xl-max": { max: "1400px" },
        "xl-max": { max: "1279px" },
        "lg-max": { max: "1023px" },
        "md-max": { max: "767px" },
        "sm-max": { max: "639px" },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

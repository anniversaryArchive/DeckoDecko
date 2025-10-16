const { colors } = require("./utils/tailwind-colors");
const { fontSize } = require("./utils/tailwind-fontSize");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors,
      },
      fontFamily: {
        Dunggeunmiso: ["Dunggeunmiso"],
        DunggeunmisoB: ["DunggeunmisoB"],
      },
      fontSize: {
        ...fontSize
      },
    },
  },
  plugins: [],
};
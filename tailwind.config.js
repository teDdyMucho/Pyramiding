/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#113F67',
          800: '#226597',
          600: '#87C0CD',
          100: '#F3F9FB',
        },
        dark: '#113F67',
        medium: '#226597',
        accent: '#87C0CD',
        light: '#F3F9FB',
      }
    },
  },
  plugins: [],
}

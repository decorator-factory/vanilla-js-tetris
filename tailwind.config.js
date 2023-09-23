/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [  // TODO: why is this still needed if Tailwind v3 has JIT mode by default?!
    {
      pattern: /^bg-/
    },
  ]
}

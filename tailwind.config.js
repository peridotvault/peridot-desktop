/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "accent_primary": "#90EE90",
        "accent_secondary": "#4D8A6A",

        "background_primary": "var(--background_primary)",
        "background_secondary": "var(--background_secondary)",
        "background_disabled": "#333333",
        "text": "var(--text)",
        "text_disabled": "gray",

        "shadow_primary": "#0F120F",
        "shadow_secondary": "#2A3B30",

        // danger
        "danger": "#c5604c",
        "warning": "#deb887",



        // subscribe 
        "lifetime": "#6CAFD9",
        "yearly": "#F1C40F",
        "monthly": "#C0C0C0",

        // temp 
      },
      gradientColorStopPositions: {
        3: '3%',
      },
      boxShadow: {
        // black background
        // large black background
        'flat-lg': '27px 27px 55px #181a19, -27px -27px 55px #202421',
        'sunken-lg': 'inset 27px 27px 55px #181a19, inset -27px -27px 55px #202421',
        // small 
        "sunken-sm": "inset 5px 5px 10px #181a19, inset -5px -5px 10px #202421",
        "arise-sm": "inset 2px 2px 5px #181a19,inset -2px -2px 5px #202421, 2px 2px 5px #181a19, -2px -2px 5px #202421",

        // green background 
        "sunken-md-green": "inset 5px 5px 10px #2e483a, inset -5px -5px 10px #3e624e",
      }
    },
  },
  plugins: [],
}
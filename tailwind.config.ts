import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          dark: '#4a4036',
          accent: '#c05621',
          cream: '#f3f0e6',
          green: '#6b8c85',
          gold: '#d4a373',
        }
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-lora)', 'serif'],
      }
    },
  },
  plugins: [],
} satisfies Config;
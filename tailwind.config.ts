import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta premium Minimalista (Blanco y Negro)
        brand: {
          50: '#ffffff',
          100: '#f9f9f9',
          200: '#f0f0f0',
          300: '#e5e5e5',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#000000', // Negro puro
        },
        // Nuevo color principal starTAP
        accent: {
          50: '#e0f7fb',
          100: '#b3ebf4',
          200: '#80dded',
          300: '#4dcee5',
          400: '#26c2df',
          500: '#01A6D2', // Color principal solicitado
          600: '#0194bc', 
          700: '#017ca0',
          800: '#006380',
          900: '#004d66',
        }
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 12px 40px -10px rgba(0, 0, 0, 0.08)',
        'input': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;

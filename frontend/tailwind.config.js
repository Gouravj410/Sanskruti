/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FCFAF6',
          100: '#F7F3EB',
          200: '#EFE8DA',
          300: '#E5DAC4',
          800: '#4A3E2D',
          900: '#2A2218',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          light: '#DE734C',
          dark: '#9E3E1B',
          deep: '#732B12',
        },
        ochre: {
          DEFAULT: '#D4AF37',
          light: '#E5C158',
          dark: '#B08D22',
        },
        indigo: {
          950: '#0B0F19',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        layer: {
          verified: '#059669',
          community: '#0284C7',
          ai: '#7C3AED',
          creative: '#EA580C',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cultural': '0 4px 20px -2px rgba(200, 90, 50, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08)',
        'cultural-lg': '0 10px 30px -5px rgba(200, 90, 50, 0.18), 0 8px 12px -6px rgba(0, 0, 0, 0.1)',
        'glow-gold': '0 0 25px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

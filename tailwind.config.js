/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SafePal-inspired palette (purple variant)
        sp: {
          bg: {
            DEFAULT: '#0E1116',
            soft: '#11151C',
            card: '#141922'
          },
          surface: '#171C26',
          border: '#232B3A',
          text: {
            DEFAULT: '#E6EAF2',
            muted: '#9AA7B8'
          },
          primary: {
            DEFAULT: '#7C4DFF', // purple
            hover: '#9C6CFF',
            ring: '#7C4DFF33'
          },
          secondary: {
            DEFAULT: '#6C63FF',
            hover: '#857CFF'
          },
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      screens: {
        'mobile': '320px',
        'tablet': '640px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s infinite',
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
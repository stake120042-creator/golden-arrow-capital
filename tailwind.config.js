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
        // Purple and white theme palette
        sp: {
          bg: {
            DEFAULT: '#ffffff',
            soft: '#f8fafc',
            card: '#ffffff'
          },
          surface: '#f1f5f9',
          border: '#e2e8f0',
          text: {
            DEFAULT: '#1f2937',
            muted: '#6b7280'
          },
          primary: {
            DEFAULT: '#8b5cf6', // purple
            hover: '#7c3aed',
            ring: '#8b5cf633'
          },
          secondary: {
            DEFAULT: '#a78bfa',
            hover: '#8b5cf6'
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
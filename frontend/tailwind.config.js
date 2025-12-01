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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        nexus: {
          dark: '#0f172a',
          blue: '#2563eb',
          purple: '#7c3aed',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'nexus': '0 4px 20px rgba(37, 99, 235, 0.15)',
        'purple-glow': '0 0 20px rgba(147, 51, 234, 0.5)',
        'purple-glow-lg': '0 0 30px rgba(147, 51, 234, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
        'gradient-purple-dark': 'linear-gradient(135deg, #7e22ce 0%, #581c87 100%)',
        'login-bg': "url('/src/assets/wallpapperloginsignin.png')",
        'button-bg': "url('/src/assets/botonloginsignin.png')",
        'vista-login': "url('/src/assets/Vista1Login.png')",
      },
      fontSize: {
        'orbitron-title': '3.9rem',
      },
      textShadow: {
        'white-glow': '0 0 8px rgba(255, 255, 255, 0.473)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
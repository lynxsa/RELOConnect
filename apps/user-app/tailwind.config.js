/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0057FF',
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CCFF',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#0057FF',
          600: '#0047CC',
          700: '#003799',
          800: '#002766',
          900: '#001733',
        },
        secondary: {
          DEFAULT: '#00B2FF',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': '32px',
        'h2': '24px',
        'body': '16px',
        'caption': '12px',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}


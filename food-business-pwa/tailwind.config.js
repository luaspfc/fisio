/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        primary: {
          DEFAULT: '#E85D04',
          dark: '#C94E00',
          light: '#F4A261'
        },
        forest: '#2D6A4F',
        text: '#1C1C1C',
        muted: '#6B5744',
        border: '#DDD0C0',
        card: '#FFFFFF'
      },
      fontSize: {
        'base': ['18px', '1.6'],
        'lg': ['20px', '1.5'],
        'xl': ['24px', '1.4'],
        '2xl': ['28px', '1.3'],
        '3xl': ['34px', '1.2'],
        '4xl': ['40px', '1.1']
      },
      minHeight: {
        'tap': '56px'
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)'
      }
    }
  },
  plugins: []
}

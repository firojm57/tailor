/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {},
    colors: { 
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      primary: '#6d28d9',
      secondary: '#9ca3af',
      success: '#16a34a',
      danger: '#b91c1c',
      warn: '#d97706',
      info: '#0891b2'
    },
    fontFamily: {
      sans: [
        'Poppins',
        'sans-serif',
        'system-ui',
        '-apple-system'
      ]
    },
  },
  plugins: [
    plugin(function({ addBase, theme }) {
      addBase({
        'h1': { fontSize: theme('fontSize.2xl') },
        'h2': { fontSize: theme('fontSize.xl') },
        'h3': { fontSize: theme('fontSize.lg') },
        'h4': { fontSize: theme('fontSize.base') },
        'h5': { fontSize: theme('fontSize.sm') },
        'h6': { fontSize: theme('fontSize.xs') },
      })
    })
  ],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./{brand,district,green,innovation,insight,news,sitemap}/**/*.html",
    "./assets/js/**/*.js",
  ],
  theme: {
    screens: {
      'xl': { max: '1440px' },
      'lg': { max: '921px' },
      'md': { max: '768px' },
      'sm': { max: '480px' },
    },
    extend: {
      fontFamily: {
        sans:  ['Noto Sans TC', 'Inter', 'sans-serif'],
        inter: ['Inter', 'Noto Sans TC', 'sans-serif'],
        tc:    ['Noto Sans TC', 'sans-serif'],
      },
      colors: {
        primary:  '#185EAA',
        purple:   '#332784',
        dark:     '#101215',
        innov:    '#493276',
        green:    '#A7AAC6',
        brand:    '#3B4E8A',
        district: '#ECEDEE',
        insight:  '#2261A4',
        gray1:    '#22272C',
        gray2:    '#37393B',
        alert:    '#D9534F',
      },
      maxWidth: {
        canvas:  '1920px',
        layout:  '1440px',
        content: '1200px',
      },
      spacing: {
        'lr':  '8.333%',
        '2lr': '16.666%',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },
    },
  },
  plugins: [],
}

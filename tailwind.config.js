/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#f4f7fb',
          surface: '#ffffff',
          text: '#12263a',
          muted: '#5c6b7a',
          primary: '#0052cc',
          accent: '#00a991',
          border: '#dbe2ea',
        },
      },
      borderRadius: {
        lab: '0.875rem',
      },
      boxShadow: {
        lab: '0 10px 30px rgba(18, 38, 58, 0.08)',
      },
    },
  },
  plugins: [],
}

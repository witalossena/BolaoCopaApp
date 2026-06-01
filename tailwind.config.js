/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0a130d',
        surface:  '#0f1d14',
        surface2: '#13261a',
        edge:     '#1f3a29',
        edge2:    '#2a5038',
        grass:    { DEFAULT: '#34c75e', 600: '#27a64d', 700: '#1d8a3e', 400: '#5fd97f', dim: '#16331f' },
        gold:     { DEFAULT: '#e3b23c', 400: '#f0c861', dim: '#3a2f12' },
        cream:    '#f4efe2',
        mute:     '#8ba395',
        mute2:    '#5f7568',
        danger:   '#e06a4a',
      },
      fontFamily: {
        display: ['Bevan', 'serif'],
        sans:    ['Barlow', 'system-ui', 'sans-serif'],
        cond:    ['"Barlow Semi Condensed"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 18px 40px -20px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
}

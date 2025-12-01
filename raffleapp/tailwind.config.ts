import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CA6E8',
        secondary: '#FFD447',
        highlight: '#FF6B6B',
        light_bg: '#F8F8F8',
        text_primary: '#222222',
        text_secondary: '#666666',
      },
      fontFamily: {
        title: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

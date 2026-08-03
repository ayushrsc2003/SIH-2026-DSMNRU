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
        background: '#0A0E17',
        surface: {
          DEFAULT: '#111726',
          light: '#1A233A',
          border: '#24304D',
        },
        saffron: {
          DEFAULT: '#FF7A29',
          hover: '#FF8F47',
          glow: 'rgba(255, 122, 41, 0.25)',
        },
        accentGreen: {
          DEFAULT: '#1FAE7A',
          hover: '#26C88D',
          glow: 'rgba(31, 174, 122, 0.25)',
        },
        navy: {
          900: '#0A0E17',
          800: '#0D1322',
          700: '#141C2E',
          600: '#1F2B45',
        }
      },
      fontFamily: {
        sans: ['var(--font-ibm-sans)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'monospace'],
      },
      boxShadow: {
        'saffron-glow': '0 0 25px rgba(255, 122, 41, 0.3)',
        'green-glow': '0 0 25px rgba(31, 174, 122, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}

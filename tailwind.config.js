/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Tether + Transsion visual identity blend:
        // Dark, confident, African-emergence energy
        bg: {
          DEFAULT: '#0a0a0a',
          elevated: '#141414',
          muted: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#26A17B', // Tether green
          dim: '#1e7d5e',
          glow: '#3dbf96',
        },
        transsion: {
          orange: '#FF6A00', // Transsion / Infinix signature
          gold: '#F5C542',
        },
        text: {
          DEFAULT: '#F5F5F5',
          muted: '#9A9A9A',
          faint: '#555555',
        },
      },
      fontFamily: {
        display: ['System'],
        mono: ['SpaceMono'],
      },
    },
  },
  plugins: [],
};

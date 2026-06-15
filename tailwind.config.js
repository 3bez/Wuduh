/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Navy — dominant brand
        navy: {
          950: '#0A1622',
          900: '#0D1B2A',
          800: '#132A40',
          700: '#1B3A56',
          600: '#244C6E',
          500: '#305F86',
          400: '#4D7CA3',
          300: '#7BA0BF',
          200: '#AEC6D9',
          100: '#D7E3EC',
          50:  '#EEF3F7',
        },
        // Gold — accent, used sparingly
        gold: {
          700: '#8A6F26',
          600: '#A6852F',
          500: '#C9A84C',
          400: '#D6BC72',
          300: '#E3CF9A',
          200: '#EEE0BF',
          100: '#F6EEDB',
        },
        // Teal — support
        teal: {
          700: '#0A6E66',
          600: '#0B8077',
          500: '#0D9488',
          400: '#2EB3A6',
          300: '#6FCCC2',
          200: '#A9E0D9',
          100: '#D8F1EE',
        },
        // Slate — UI neutrals
        slate: {
          900: '#141A22',
          800: '#232C38',
          700: '#36404D',
          600: '#4A5666',
          500: '#647183',
          400: '#8795A6',
          300: '#B4BFCB',
          200: '#D4DBE3',
          100: '#E8ECF1',
          50:  '#F4F6F8',
        },
        // Semantic
        success: { 600: '#11724E', 500: '#15805A', 100: '#DCEFE6' },
        warning: { 600: '#B4811E', 500: '#D99A2B', 100: '#F8ECCE' },
        danger:  { 600: '#A53D27', 500: '#C0492F', 100: '#F6E0DA' },
        // Paper — export document surface
        paper: '#FAF7F0',
      },
      fontFamily: {
        display: ['IBM Plex Serif', 'Georgia', 'serif'],
        sans:    ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        arabic:  ['IBM Plex Sans Arabic', 'IBM Plex Sans', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': '11px',
        xs:    '12px',
        sm:    '14px',
        base:  '16px',
        md:    '18px',
        lg:    '21px',
        xl:    '26px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '52px',
      },
      borderRadius: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '22px',
        '2xl':'28px',
      },
      boxShadow: {
        xs:   '0 1px 2px rgba(13,27,42,0.06)',
        sm:   '0 1px 3px rgba(13,27,42,0.08), 0 1px 2px rgba(13,27,42,0.04)',
        md:   '0 4px 12px rgba(13,27,42,0.08), 0 2px 4px rgba(13,27,42,0.05)',
        lg:   '0 12px 28px rgba(13,27,42,0.12), 0 4px 8px rgba(13,27,42,0.06)',
        xl:   '0 24px 56px rgba(13,27,42,0.18), 0 8px 16px rgba(13,27,42,0.08)',
        gold: '0 8px 24px rgba(201,168,76,0.28)',
      },
      maxWidth: {
        container: '1120px',
        narrow:    '720px',
      },
    },
  },
  plugins: [],
}

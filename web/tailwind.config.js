/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--theme-primary)',
        secondary: 'var(--theme-secondary)',
        surface: 'var(--theme-surface)',
        bg: 'var(--theme-bg)',
        text: 'var(--theme-text)',
        'text-muted': 'var(--theme-text-muted)',
        border: 'var(--theme-border)',
        cyberpunk: {
          primary: 'var(--color-cyberpunk-primary)',
          secondary: 'var(--color-cyberpunk-secondary)',
          accent: 'var(--color-cyberpunk-accent)',
          bg: 'var(--color-cyberpunk-bg)',
          text: 'var(--color-cyberpunk-text)',
        },
        glass: {
          primary: 'var(--color-glass-primary)',
          secondary: 'var(--color-glass-secondary)',
          accent: 'var(--color-glass-accent)',
          bg: 'var(--color-glass-bg)',
          text: 'var(--color-glass-text)',
        },
        minimal: {
          primary: 'var(--color-minimal-primary)',
          secondary: 'var(--color-minimal-secondary)',
          accent: 'var(--color-minimal-accent)',
          bg: 'var(--color-minimal-bg)',
          text: 'var(--color-minimal-text)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          light: '#3d9aff',
          dark: '#006edb',
          dim: '#0071e3',
        },
        accent: {
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.72)',
          hover: 'rgba(255, 255, 255, 0.85)',
          active: 'rgba(255, 255, 255, 0.95)',
          dark: 'rgba(30, 30, 30, 0.72)',
          'dark-hover': 'rgba(40, 40, 40, 0.85)',
          'dark-active': 'rgba(50, 50, 50, 0.95)',
        },
      },
      borderRadius: {
        'macos': '14px',
        'macos-lg': '18px',
        'macos-xl': '22px',
        'macos-2xl': '28px',
      },
      boxShadow: {
        'macos': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'macos-md': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'macos-lg': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'macos-xl': '0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06)',
        'macos-glow': '0 0 20px rgba(0, 122, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)',
        'macos-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        'macos-dark': '0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)',
        'macos-dark-md': '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
        'macos-dark-lg': '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'macos': '40px',
        'macos-lg': '60px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

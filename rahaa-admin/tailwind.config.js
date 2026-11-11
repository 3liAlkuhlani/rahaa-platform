/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rahaa: {
          navy: 'var(--navy-color)',
          'navy-deep': 'var(--navy-deep)',
          primary: 'var(--primary-color)',
          blue: {
            DEFAULT: 'var(--primary-color)',
            hover: 'var(--primary-hover)',
            light: 'var(--primary-light)',
            soft: 'var(--primary-soft)',
            avatar: 'var(--primary-avatar)',
          },
          orange: {
            DEFAULT: 'var(--secondary-color)',
            hover: 'var(--secondary-hover)',
            light: 'var(--secondary-light)',
            soft: 'var(--secondary-soft)',
          },
          accent: {
            DEFAULT: 'var(--accent-color)',
            light: 'var(--accent-light)',
          },
          bg: 'var(--background-color)',
          card: 'var(--surface-color)',
          border: {
            DEFAULT: 'var(--border-color)',
            light: 'var(--border-light)',
          },
          text: {
            main: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            muted: 'var(--text-muted)',
            subtle: 'var(--text-subtle)',
          },
          emerald: {
            DEFAULT: 'var(--success-color)',
            badge: '#047857',
            bg: 'var(--success-light)',
            solid: '#6EE7B7',
          },
          amber: {
            DEFAULT: 'var(--warning-color)',
            bg: 'var(--warning-light)',
            soft: '#FEF3C7',
          },
          rose: {
            DEFAULT: 'var(--danger-color)',
            badge: '#DC2626',
            bg: 'var(--danger-light)',
          },
          purple: {
            DEFAULT: '#7C3AED',
            soft: '#F5F3FF',
          }
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      boxShadow: {
        'rahaa-xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'rahaa-sm': 'var(--shadow-sm)',
        'rahaa-card': 'var(--shadow-md)',
        'rahaa-md': 'var(--shadow-md)',
        'rahaa-lg': 'var(--shadow-lg)',
        'rahaa-xl': 'var(--shadow-xl)',
      },
      borderRadius: {
        'rahaa-sm': '8px',
        'rahaa': '12px',
        'rahaa-lg': '16px',
        'rahaa-xl': '20px',
        'rahaa-2xl': '24px',
      }
    },
  },
  plugins: [],
}

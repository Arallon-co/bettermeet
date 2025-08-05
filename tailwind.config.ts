import type { Config } from 'tailwindcss'
import { nextui } from '@nextui-org/react'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Custom spacing for mobile optimization
        '18': '4.5rem',
        '88': '22rem',
        'touch': '44px', // Minimum touch target size
      },
      animation: {
        // Custom animations for mobile interactions
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              DEFAULT: '#3b82f6',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              DEFAULT: '#64748b',
              foreground: '#ffffff',
            },
            success: {
              50: '#f0fdf4',
              500: '#22c55e',
              600: '#16a34a',
              DEFAULT: '#22c55e',
              foreground: '#ffffff',
            },
            warning: {
              50: '#fffbeb',
              500: '#f59e0b',
              600: '#d97706',
              DEFAULT: '#f59e0b',
              foreground: '#ffffff',
            },
            danger: {
              50: '#fef2f2',
              500: '#ef4444',
              600: '#dc2626',
              DEFAULT: '#ef4444',
              foreground: '#ffffff',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              DEFAULT: '#3b82f6',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              DEFAULT: '#64748b',
              foreground: '#ffffff',
            },
            success: {
              50: '#f0fdf4',
              500: '#22c55e',
              600: '#16a34a',
              DEFAULT: '#22c55e',
              foreground: '#ffffff',
            },
            warning: {
              50: '#fffbeb',
              500: '#f59e0b',
              600: '#d97706',
              DEFAULT: '#f59e0b',
              foreground: '#ffffff',
            },
            danger: {
              50: '#fef2f2',
              500: '#ef4444',
              600: '#dc2626',
              DEFAULT: '#ef4444',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
}
export default config
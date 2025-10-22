/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
    extend: {
        colors: {
            primary: { DEFAULT: '#39B56A', dark: '#2D9255', light: '#6FDA93' },
            accent: { lime: '#A6E570', yellow: '#F9D24A' },
            neutral: {
                bg: '#F7FDF9', surface: '#FFFFFF', border: '#E3F1E7',
                text: '#1A1A1A', subtext: '#5E665E'
            },
            success: '#2BAE66', warning: '#FBBF24', error: '#EF4444', info: '#3B82F6',
        },
    },
};
export const plugins = [];

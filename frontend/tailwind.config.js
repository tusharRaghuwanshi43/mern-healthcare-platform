/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F0F4FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    500: '#818CF8', // Purple-blue for buttons
                    600: '#6366F1', // Deeper purple-blue
                    900: '#312E81',
                },
                background: '#B4C5DE', // The soft pastel blue background from the image
                card: '#FBFBFF', // The slightly off-white panel color 
                textDark: '#1E1E1E',
                textMuted: '#6B7280',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 20px 40px -10px rgba(0,0,0,0.08)',
            }
        },
    },
    plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: { 'custom-image': "url('C:/Users/victo/OneDrive/Escritorio/my_so/mi_sistema_operativo/public/imagenes/photo-1663970206579-c157cba7edda.jpg')", },
    },
  },
  plugins: [],
}

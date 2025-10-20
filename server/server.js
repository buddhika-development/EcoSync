import create_app from './src/app.js'

const app = create_app();
const PORT = process.env.PORT || 8000;


app.listen(PORT, () => {
  console.log(`Server run in ${PORT}`)
})
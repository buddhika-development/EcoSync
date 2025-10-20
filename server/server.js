import express from 'express';

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('EcoSync Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
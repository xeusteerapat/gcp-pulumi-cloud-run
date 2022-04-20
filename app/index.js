const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hi, Cloud Run. From your best friend Pulumi :)');
});

app.get('/health', (req, res) => {
  res.send({
    status: 'OK',
    message: 'Hello, Pulumi!',
  });
});

const { PORT } = process.env || 8080;

app.listen(PORT, () => console.log('server is running...'));

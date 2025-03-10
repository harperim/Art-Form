const express = require('express');
const app = express();
const port = 3000;

app.get('/nodejs', (req, res) => {
  res.send('node.js 테스트');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Zensafe Backend Service Running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
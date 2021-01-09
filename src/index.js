require('dotenv').config();

const app = require('./app');
const { PORT } = require('../config');

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});

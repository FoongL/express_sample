require('dotenv').config();
const express = require('express');

// const app = require('./src/app');
const app = express()
const PORT = process.env.PORT || 3000

console.log('running....', process.env.PORT)
app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});

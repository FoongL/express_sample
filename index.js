require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT
// const logger = require('./src/util/logger');


app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});

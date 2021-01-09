// to clean up data from format returned from knex queries
const cleanObj = (obj) => {
  for (const propName in obj) {
    if (Array.isArray(obj[propName]) || obj[propName].length === 1) {
      obj[propName] = obj[propName][0];
    }
  }
};

module.exports = {
  cleanObj,
};

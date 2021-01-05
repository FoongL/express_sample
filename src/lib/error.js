const ErrorObject = require('amk-error')

MissingParamError = (params) => {
  return new ErrorObject(`${params} missing!`, 400);
}

module.exports = {
  MissingParamError,
};

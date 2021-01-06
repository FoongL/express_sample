const ErrorObject = require('amk-error')

MissingParamError = (params) => {
  return new ErrorObject(`${params} missing!`, 400);
}

GeneralError = (msg) => {
  return new ErrorObject(msg, 400)
}

TransactionError = (type) => {
  return new ErrorObject(`${type} transaction unsuccessful`, 400)
}

InsufficientFundsError = () =>{
  return new ErrorObject('Insufficient funds in account', 400)
}

NotFoundError = (param) =>{
  return new ErrorObject(`${param} not found`, 400)
}


module.exports = {
  MissingParamError,
  GeneralError,
  TransactionError,
  InsufficientFundsError,
  NotFoundError
};

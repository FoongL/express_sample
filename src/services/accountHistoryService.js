const dateCheck = (start, end, error) => {
    if(start && String(new Date(start)) === 'Invalid Date'){
        throw error.GeneralError('Invalid start date provided');
    }
    if(end && String(new Date(end)) === 'Invalid Date'){
        throw error.GeneralError('Invalid end date provided');
    }
    console.log(new Date(start) > new Date(end))
    if (new Date(start) > new Date(end)){
        throw error.GeneralError('End date cannot be before Start Date');
    }
    return true
  };

  const queryBuilder = ( account, type, status, error) => {
      const output = {account_id: account }
    if(type){
        if(!['DEPOSIT','WITHDRAW','TRANSFER','FIX'].includes(type.trim().toUpperCase())){
            throw error.GeneralError('Transaction Type not recognized');
        }
        output.type = type.trim().toUpperCase()
    }
    if (status){
        if(!['SUCCESSFUL', 'FAILED', 'FIXED'].includes(status.trim().toUpperCase())){
            throw error.GeneralError('Transaction Status not recognized');
        }
        output.status = status.trim().toUpperCase()
    }
    return output
  };

module.exports = {
  dateCheck,
  queryBuilder
};

module.exports = () => (err, req, res, next) => {
    let status = err.status || err.statusCode || 500
    if (status < 400) status = 500
    res.statusCode = status

    const body = {
        status,
        stack: err.stack,
    }

    if (status === 401) {
        // Default Auth Error
        body.code = 'PERMISSION_DENIED'
        body.message = 'You are not authorized for this resource.'
    } else {
        body.message = err.message
    }
    res.json({
        error: body,
    })
}

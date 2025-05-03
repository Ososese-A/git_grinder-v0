const logger = (req, res, next) => {
    const path = req.path 
    const method = req.method
    console.log(`Incoming ${method} request to ${path}`)
    next()
}

module.exports = logger
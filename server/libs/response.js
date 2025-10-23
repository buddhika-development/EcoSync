
export const SUCCESS = (message, data) => ({
    success: true,
    message: message || "Request was successful",
    data: data || null,
    timestamp: new Date().toISOString()
})


export const ERROR = (message, error) => ({
    success: false,
    message: message || "An error occurred",
    error: error || null,
    timestamp: new Date().toISOString()
})

export const okay = (res, data = {}, message = 'OK', status = 200) => {
    res.status(status).json({
        ok: true,
        message,
        data
    })
}

export const fail = (res, message = 'Error', status = 400, extra = {}) => {
    res.status(status).json({
        ok: false,
        errors: {
            message,
            ...(extra || {})
        }
    })
};


export const sendResponse = (res, status, message) => {
    res.status(status).json({ message });
};


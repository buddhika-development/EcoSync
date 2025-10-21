
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


export const sendResponse = (res, response) => (
    res.status(response.success ? 200 : 400).json(response)
)



export const SUCCESS = (data, message) => ({
    status: "success",
    message: message || "Request was successful",
    data: data || null,
    timestamp: new Date().toISOString()
})


export const ERROR = (error, message) => ({
    status: "error",
    message: message || "An error occurred",
    error: error || null,
    timestamp: new Date().toISOString()
})


export const sendResponse = (res, response) => (
    res.status(response.status === "success" ? 200 : 400).json(response)
)


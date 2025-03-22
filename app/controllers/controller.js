class Controller {
    /**
     * Handles errors and sends a consistent error response.
     * @param {Object} reply - The reply object to send the error response.
     * @param {Error} error - The error object.
     */
    static handleError(reply, error) {
        console.error(error) // Log the error for debugging
        reply.status(400).send({ error: error.message })
    }
}

module.exports = Controller

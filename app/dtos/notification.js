const DTO = require('./dto')

class NotificationDTO extends DTO {
    id
    type
    title
    body
    data
    userId
}

module.exports = NotificationDTO

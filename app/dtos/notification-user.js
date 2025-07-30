const DTO = require('./dto')

class NotificationUserDTO extends DTO {
    id
    notificationId
    userId
    read
    archived
}

module.exports = NotificationUserDTO

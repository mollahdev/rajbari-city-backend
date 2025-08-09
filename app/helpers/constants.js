const DATE_FORMAT = 'YYYY-MM-DD'
const TIME_FORMAT = 'HH:mm:ss'
const DATE_TIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`
const PLACEHOLDER_AVATAR = 'avatar-placeholder.jpeg'
const PLACEHOLDER_IMAGE = 'placeholder-image.webp'
const TIMEZONE = 'Asia/Dhaka'

const ROLES = Object.freeze({
    OWNER: 'owner', // highest level of access
    ADMIN: 'admin', // can manage users and settings
    EDITOR: 'editor', // can edit content
    USER: 'user', // can view content
    GUEST: 'guest', // limited access
})

const ROLE_PRIORITY = [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.EDITOR,
    ROLES.USER,
    ROLES.GUEST,
]

module.exports = {
    ROLES,
    ROLE_PRIORITY,
    DATE_TIME_FORMAT,
    DATE_FORMAT,
    TIME_FORMAT,
    PLACEHOLDER_AVATAR,
    PLACEHOLDER_IMAGE,
    TIMEZONE,
}

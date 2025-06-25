/**
 * External dependencies
 */
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { isString } = require('lodash')
/**
 * Internal dependencies
 */
const {
    DATE_TIME_FORMAT,
    PLACEHOLDER_AVATAR,
    PLACEHOLDER_IMAGE,
} = require('./constants')

function now() {
    dayjs.extend(utc)
    return dayjs().utc().format(DATE_TIME_FORMAT)
}

function getPaginationObject(page, perPage = 10) {
    const pageNum = Math.max(1, parseInt(page, 10))
    const limit = parseInt(perPage, 10) // Number of records per page
    const offset = (pageNum - 1) * limit // Calculate offset
    return { limit, offset }
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000)
}

function isOTPResendAllowed(otpCreatedAt) {
    return !dayjs(otpCreatedAt).add(1, 'minute').isAfter(now())
}

function getFileUrl(path) {
    if (!isString(path)) {
        return null
    }
    return `${process.env.STORAGE_BASE}/${path}`
}

function getFileFromPath(path) {
    if (!isString(path)) {
        return null
    }

    const imageFile = path.split('/').pop()

    if ([PLACEHOLDER_AVATAR, PLACEHOLDER_IMAGE].includes(imageFile)) {
        return null
    }

    return imageFile
}

module.exports = {
    now,
    getPaginationObject,
    generateOTP,
    isOTPResendAllowed,
    getFileUrl,
    getFileFromPath,
}

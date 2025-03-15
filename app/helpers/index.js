/**
 * External dependencies
 */
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
/**
 * Internal dependencies
 */
const { DATE_TIME_FORMAT } = require('./constants')

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
    return !dayjs(otpCreatedAt).add(3, 'minute').isAfter(now())
}

function getFileUrl(path) {
    return `${process.env.STORAGE_BASE}/${path}`
}

function getFileFromPath(path) {
    return path.split('/').pop()
}

module.exports = {
    now,
    getPaginationObject,
    generateOTP,
    isOTPResendAllowed,
    getFileUrl,
    getFileFromPath,
}

/**
 * External dependencies
 */
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { isString } = require('lodash')

dayjs.extend(utc)
dayjs.extend(timezone)
/**
 * Internal dependencies
 */
const {
    DATE_TIME_FORMAT,
    DATE_FORMAT,
    PLACEHOLDER_AVATAR,
    PLACEHOLDER_IMAGE,
    TIMEZONE,
} = require('./constants')

function now() {
    return dayjs().tz(TIMEZONE).format(DATE_TIME_FORMAT)
}

function todayDateOnly() {
    return dayjs().tz(TIMEZONE).startOf('day').format(DATE_FORMAT)
}

function isPastDate(dateTimeStr) {
    const today = dayjs().tz(TIMEZONE).startOf('day')
    const inputDate = dayjs.tz(dateTimeStr, TIMEZONE).startOf('day')
    return inputDate.isBefore(today)
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
    isPastDate,
    todayDateOnly,
}

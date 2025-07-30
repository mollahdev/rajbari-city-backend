/**
 * External dependencies
 */
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const { isString } = require('lodash')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
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

function convertUnixDateTime(unixTimestamp) {
    return dayjs.unix(unixTimestamp).tz(TIMEZONE).format(DATE_TIME_FORMAT)
}

function convertToTimeFormat(input) {
    const cleaned = input.trim().toUpperCase()
    const parsed = dayjs(
        cleaned,
        ['h:mmA', 'h:mm A', 'hA', 'h A', 'HH:mm:ss', 'H:mm:ss'],
        true
    )

    if (!parsed.isValid()) {
        throw new Error(`Invalid time format: "${input}"`)
    }

    return parsed.format('HH:mm:ss')
}

function isValidTimeFormat(inputTime) {
    const cleaned = inputTime.trim().toUpperCase()
    const parsed = dayjs(
        cleaned,
        ['h:mmA', 'h:mm A', 'hA', 'h A', 'HH:mm:ss', 'H:mm:ss'],
        true
    )
    return parsed.isValid()
}

function normalizeCode(input) {
    //extract number and remove spaces
    if (!isString(input)) {
        return input
    }
    return input.replace(/\D/g, '').replace(/\s+/g, '').toUpperCase()
}

function getDateTimeAdd(days, unit = 'day') {
    return dayjs().tz(TIMEZONE).add(days, unit).format(DATE_TIME_FORMAT)
}

module.exports = {
    now,
    getPaginationObject,
    generateOTP,
    convertUnixDateTime,
    getDateTimeAdd,
    isOTPResendAllowed,
    getFileUrl,
    getFileFromPath,
    isPastDate,
    todayDateOnly,
    convertToTimeFormat,
    isValidTimeFormat,
    normalizeCode,
}

const AWS = require('aws-sdk')
const { isString } = require('lodash')

// Configure Cloudflare R2 (Replace with your details)
const r2 = new AWS.S3({
    endpoint: process.env.STORAGE_HOST,
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
    signatureVersion: 'v4',
    region: 'auto', // Cloudflare R2 does not use traditional AWS regions
})

module.exports = class Storage {
    static async upload(data, folder = null) {
        let fileKey = `${Date.now()}-${data.filename}`

        if (isString(folder)) {
            fileKey = `${folder}/${fileKey}`
        }

        const payload = await data.toBuffer()

        const params = {
            Bucket: process.env.STORAGE_BUCKET,
            Key: fileKey,
            Body: payload,
            ACL: 'public-read',
            ContentType: data.mimetype,
        }
        try {
            const response = await r2.upload(params).promise()
            response.Filename = response.Key.replace(`${folder}/`, '')

            return response
        } catch (err) {
            return err
        }
    }
}

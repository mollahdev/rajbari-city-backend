const yup = require('yup')

const driverSchema = yup.object({
    experience: yup.number().min(0).required(),
    licenseNumber: yup.string().required(),
    isActive: yup.boolean().required(),
})

module.exports = {
    driverSchema,
}

const yup = require('yup')

const doctorListQuerySchema = yup.object({
    category: yup.string().uuid('Invalid category ID').optional(),
    location: yup.string().uuid('Invalid location ID').optional(),
    bmdcNumber: yup.string().optional(),
})

module.exports = {
    doctorListQuerySchema,
}

const yup = require('yup')

const vehicleSchema = yup.object({
    type: yup
        .string()
        .oneOf(['car', 'truck'], 'Type must be either car or truck')
        .required('Type is required'),
    model: yup.string().trim().required('Model is required'),
    size: yup.string().required('Size is required'),
    upazila: yup.string().trim().required('Upazila is required'),
    address: yup.string().trim().required('Address is required'),
    description: yup.string().nullable(),
    image: yup.string().nullable(),
})

module.exports = {
    vehicleSchema,
}

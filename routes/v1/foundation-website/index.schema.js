const yup = require('yup')

const bloodDonorListSchema = yup.object({
    bloodGroup: yup
        .string()
        .transform((value) => (value ? value.replace(' ', '+') : value))
        .matches(
            /^(A|B|AB|O)[+-]$/,
            'bloodGroup must be one of the following: A+, A-, B+, B-, AB+, AB-, O+, O-'
        ),
    upazila: yup.string(),
    gender: yup.string().oneOf(['male', 'female']),
    search: yup.string(),
})

module.exports = {
    bloodDonorListSchema,
}

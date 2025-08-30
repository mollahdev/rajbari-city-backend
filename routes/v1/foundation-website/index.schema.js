const yup = require('yup')

const foundationDonorSchema = yup.object({
    bloodGroup: yup
        .string()
        .matches(
            /^(A|B|AB|O)[+-]$/,
            'bloodGroup must be one of the following: A+, A-, B+, B-, AB+, AB-, O+, O-'
        )
        .required('bloodGroup is required'),
    lastDonatedAt: yup.date().nullable(),
    name: yup.string().required('name is required'),
    mobile: yup.string().required('mobile is required'),
    dialCode: yup.string().required('dialCode is required'),
    dob: yup.date().required('Date of birth is required'),
    gender: yup
        .string()
        .oneOf(['male', 'female'], 'Gender must be either male or female')
        .required('Gender is required'),
    upazila: yup.string().required('upazila is required'),
    isMunicipality: yup
        .boolean()
        .strict() // Ensures `true/false` is not interpreted as `"true"` or `"false"`
        .default(false),
    municipality: yup.string().when('isMunicipality', {
        is: true,
        then: (schema) => schema.required('municipality is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    union: yup.string().when('isMunicipality', {
        is: false,
        then: (schema) => schema.required('union is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    profilePictureUrl: yup.string().nullable(),
})

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
    foundationDonorSchema,
}

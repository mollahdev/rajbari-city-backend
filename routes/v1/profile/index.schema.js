const yup = require('yup')

const updateProfileSchema = yup.object({
    name: yup.string().required('name is required'),
    dob: yup.date().required('Date of birth is required'),
    gender: yup
        .string()
        .oneOf(['male', 'female'], 'Gender must be either male or female')
        .required('Gender is required'),
    upazila: yup.string().required('upazila is required'),
    isMunicipality: yup
        .boolean()
        .strict() // Ensures `true/false` is not interpreted as `"true"` or `"false"`
        .required('isMunicipality is required'),
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
    profilePictureFile: yup.string().nullable(),
})

const passwordChangeSchema = yup.object({
    oldPassword: yup.string().required('oldPassword is required'),
    newPassword: yup.string().required('newPassword is required'),
})

module.exports = {
    updateProfileSchema,
    passwordChangeSchema,
}

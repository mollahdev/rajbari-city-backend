const yup = require('yup')

const foundationCreateSchema = yup.object({
    name: yup.string().required('name is required'),
    mobiles: yup
        .array()
        .of(
            yup.object({
                dialCode: yup.string().required('dialCode is required'),
                mobile: yup.string().required('mobile is required'),
                name: yup.string().required('mobile name is required'),
            })
        )
        .required('mobiles is required')
        .min(1, 'At least one mobile number is required'), // Prevents empty arrays

    socials: yup
        .array()
        .of(
            yup.object({
                title: yup.string().required('Social title is required'),
                url: yup
                    .string()
                    .url('Invalid URL')
                    .required('Social URL is required'),
            })
        )
        .default([]), // Ensures `socials` is always an array (optional field)

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
    thumbnailUrl: yup.string().nullable(),
    description: yup.string().nullable(),
})

const foundationJoinSchema = yup.object({
    foundationId: yup
        .array()
        .of(yup.string().required()) // Ensures each item is a non-empty string
        .min(1, 'foundationId must have at least one item') // Ensures the array is not empty
        .required('foundationId is required'), // Ensures the field exists
})

module.exports = {
    foundationCreateSchema,
    foundationJoinSchema,
}

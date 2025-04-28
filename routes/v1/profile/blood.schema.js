const yup = require('yup')
const donorBaseSchema = yup.object({
    bloodGroup: yup
        .string()
        .matches(
            /^(A|B|AB|O)[+-]$/,
            'bloodGroup must be one of the following: A+, A-, B+, B-, AB+, AB-, O+, O-'
        )
        .required('bloodGroup is required'),

    description: yup.string().nullable(),
    lastDonatedAt: yup.date().nullable(),
})

const createDonorSchema = donorBaseSchema.shape({
    isActive: yup.boolean().default(true),
})

const updateDonorSchema = donorBaseSchema.shape({
    isActive: yup.boolean().nullable(),
})

const baseFoundationSchema = yup.object({
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
    description: yup.string().nullable(),
})

const foundationCreateSchema = baseFoundationSchema.shape({
    thumbnailUrl: yup.string().required(),
})

const foundationUpdateSchema = baseFoundationSchema.shape({
    thumbnailFile: yup.string().nullable(),
})

const foundationJoinSchema = yup.object({
    foundationId: yup.string().required('foundationId is required'),
})

module.exports = {
    foundationCreateSchema,
    foundationUpdateSchema,
    foundationJoinSchema,
    createDonorSchema,
    updateDonorSchema,
}

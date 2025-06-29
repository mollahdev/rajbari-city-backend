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

const foundationDonorSchema = donorBaseSchema.shape({
    status: yup
        .string()
        .oneOf(['active', 'inactive', 'pending', 'blocked'])
        .default('active')
        .required('status is required'),
    name: yup.string().required('name is required'),
    mobile: yup.string().required('mobile is required'),
    dialCode: yup.string().required('dialCode is required'),
    dob: yup.date().required('Date of birth is required'),
    gender: yup
        .string()
        .oneOf(['male', 'female'], 'Gender must be either male or female')
        .required('Gender is required'),
    district: yup.string().required('district is required'),
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

const bloodFoundationMemberSchema = yup.object({
    status: yup.lazy((value) => {
        if (Array.isArray(value)) {
            return yup.array().of(yup.string().oneOf(['active', 'pending']))
        }
        return yup.string().oneOf(['active', 'pending'])
    }),
})

const bloodFoundationMemberStatusSchema = yup.object({
    status: yup.string().oneOf(['active', 'inactive', 'pending', 'blocked']),
    role: yup.string().oneOf(['admin', 'member', 'owner']),
})

const bloodFoundationDonorListSchema = yup.object({
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

const createBloodRequestSchema = yup.object({
    bloodGroup: yup
        .string()
        .matches(
            /^(A|B|AB|O)[+-]$/,
            'bloodGroup must be one of the following: A+, A-, B+, B-, AB+, AB-, O+, O-'
        )
        .required('bloodGroup is required'),
    quantity: yup
        .number()
        .required('quantity is required')
        .min(1, 'Quantity must be at least 1'),
    problem: yup.string().required('problem is required'),
    dialCode: yup.string().required('dialCode is required'),
    mobile: yup.string().required('mobile is required'),
    locationType: yup
        .string()
        .oneOf(['hospital', 'diagnostic', 'other'])
        .required('locationType is required'),
    location: yup.string().required('location is required'),
    date: yup.date().required('date is required'),
    description: yup.string().nullable(),
})

const updateBloodRequestSchema = createBloodRequestSchema

module.exports = {
    foundationCreateSchema,
    foundationUpdateSchema,
    createDonorSchema,
    updateDonorSchema,
    foundationDonorSchema,
    bloodFoundationMemberSchema,
    bloodFoundationMemberStatusSchema,
    bloodFoundationDonorListSchema,
    createBloodRequestSchema,
    updateBloodRequestSchema,
}

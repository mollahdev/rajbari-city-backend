const yup = require('yup')

const availabilitySchema = (day) =>
    yup.object({
        isAvailable: yup.boolean().default(false),
        startTime: yup.string().required(`${day} start time is required`),
        endTime: yup.string().required(`${day} end time is required`),
    })

const doctorSchema = yup.object({
    bmdcNumber: yup.string().trim().required('BMDC number is required'),
    categoryIds: yup
        .array()
        .of(yup.string().uuid('Invalid category ID'))
        .required('At least one category is required')
        .min(1, 'At least one category is required'),
    name: yup.string().trim().required('name is required'),
    education: yup.string().required('education is required'),
    mobile: yup.string().required('mobile is required'),
    dialCode: yup.string().default('880'),
    gender: yup
        .string()
        .oneOf(['male', 'female'], 'Gender must be either male or female')
        .required('Gender is required'),
    locationType: yup
        .string()
        .oneOf(['hospital', 'diagnostic', 'other'])
        .required('locationType is required'),
    location: yup.string().required('location is required'),
    profilePictureUrl: yup.string().nullable(),
    description: yup.string().nullable(),
    status: yup
        .string()
        .oneOf(
            ['active', 'inactive'],
            'Status must be either active or inactive'
        )
        .default('active'),
    availability: yup
        .object({
            saturday: availabilitySchema('Saturday'),
            sunday: availabilitySchema('Sunday'),
            monday: availabilitySchema('Monday'),
            tuesday: availabilitySchema('Tuesday'),
            wednesday: availabilitySchema('Wednesday'),
            thursday: availabilitySchema('Thursday'),
            friday: availabilitySchema('Friday'),
        })
        .required('Availability is required'),
})

module.exports = {
    doctorSchema,
}

module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '0.0.2',
                    updateFor: ['android'], // ios, android, optional
                    updateType: 'optional', // force, optional
                    changeLog: [
                        'রক্তের ফিচার যুক্ত হয়েছে',
                        'রক্তের ফাউন্ডেশন যুক্ত হয়েছে',
                        'বাগ ফিক্স করা হয়েছে',
                        'ভূমি রেকর্ড ও ম্যাপ ওুয়েবসাইট যুক্ত হয়েছে',
                    ],
                    android: {
                        49: 'https://play.google.com/store/apps/details?id=com.flexlab.rajbaricity',
                        5: 'https://play.google.com/store/apps/details?id=com.flexlab.noakhalicity',
                    },
                    ios: {
                        49: '#',
                        5: '#',
                    },
                },
            })
        },
    })
}

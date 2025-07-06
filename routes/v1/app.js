module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '0.0.5',
                    updateFor: ['android'], // ios, android, optional
                    updateType: 'force', // force, optional
                    changeLog: [
                        'রক্তের রিকুয়েষ্ট ফিচার যুক্ত হয়েছে',
                        'পোষ্ট হিষ্টরি যুক্ত হয়েছে',
                        'বাগ ফিক্স করা হয়েছে',
                    ],
                    android: {
                        49: 'https://play.google.com/store/apps/details?id=com.flexlab.rajbaricity',
                        // 5: 'https://play.google.com/store/apps/details?id=com.flexlab.noakhalicity',
                    },
                    ios: {
                        49: '#',
                        // 5: '#',
                    },
                },
            })
        },
    })
}

module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '0.0.1',
                    updateFor: ['android'], // ios, android, optional
                    updateType: 'optional', // force, optional
                    changeLog: [
                        'পৌরসভা যোগ করা হয়েছে',
                        'ছবির আকার বৃদ্ধি করা হয়েছে',
                        'বাগ ফিক্স করা হয়েছে',
                        'সরকারি ওয়েবসাইট যোগ করা হয়েছে',
                    ],
                    android: {
                        49: 'https://play.google.com/store/apps/details?id=com.flexlab.rajbaricity',
                    },
                    ios: {
                        49: 'https://rajbaricity.com/',
                    },
                },
            })
        },
    })
}

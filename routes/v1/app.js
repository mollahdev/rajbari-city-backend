module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '1.0.0',
                    updateFor: ['ios', 'android'], // ios, android, optional
                    updateType: 'optional', // force, optional
                    changeLog: [
                        'নতুন ফিচার',
                        'বাগ ফিক্স',
                        'পারফরমেন্স ইম্প্রুভমেন্ট',
                        'সিকিউরিটি ইম্প্রুভমেন্ট',
                        'অন্যান্য আপডেট',
                    ],
                    android: {
                        49: 'https://rajbaricity.com/',
                    },
                    ios: {
                        49: 'https://rajbaricity.com/',
                    },
                },
            })
        },
    })
}

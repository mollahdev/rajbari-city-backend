module.exports = async function (routes) {
    routes.get('/release', {
        handler: async (req, res) => {
            res.send({
                message: 'App informaton',
                data: {
                    version: '0.0.1',
                    updateFor: ['android'], // ios, android, optional
                    updateType: 'force', // force, optional
                    changeLog: [
                        'পৌরসভা যোগ করা হয়েছে',
                        'ছবির আকার বৃদ্ধি করা হয়েছে',
                        'বাগ ফিক্স করা হয়েছে',
                        'সরকারি ওয়েবসাইট যোগ করা হয়েছে',
                    ],
                    android: {
                        49: 'https://drive.google.com/file/d/1tdXkIJ8L49qq69jhJZjFtTYeK1eUXCn3/view?usp=sharing',
                    },
                    ios: {
                        49: 'https://rajbaricity.com/',
                    },
                },
            })
        },
    })
}

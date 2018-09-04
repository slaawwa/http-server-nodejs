export default [{
    path: '/api/init',
    method: 'POST',
    handler: async (req, res) => {
        // NOTE: Need for testing
        console.log(' -> res.json:', res.json1)
        console.log(' -> res.keys:', Object.keys(res))
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '',
                    data: {
                        user: 'Slaawwa'
                    }
                })
            }, 1500)
        })
        /*res.json({
            success: true,
            message: '',
            data: 'api/init',
        })*/
    }
}, {
    path: '/api/test',
    method: 'POST',
    handler: () => {
        return {
            success: true,
            data: {
                isAdmin: true
            },
            message: ''
        }
    },
}]

export default {
    path: '/api/email',
    method: 'POST',
    handler() {
        // NOTE: Need for testing
        // console.log(' -> this:', this)
        const data = {
            email: 'support@gmail.com'
        }
        return { success: true, message: '', data }
    }
}

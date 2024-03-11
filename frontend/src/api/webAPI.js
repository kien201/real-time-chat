import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

const webAPI = {
    home: {
        login(data) {
            return api.post('/login', data)
        },
        register(data) {
            return api.post('/register', data)
        },
    },
    user: {
        getAll() {
            return api.get('/user')
        },
        create(data) {
            return api.post('/user', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        },
        edit(id, data) {
            return api.put(`/user/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        },
        delete(id) {
            return api.delete(`/user/${id}`)
        },
        findByName(name) {
            return api.get('/user/findbyname', { params: { name } })
        },
        getCurrentUser() {
            return api.get('/user/getcurrentuser')
        },
        logout() {
            return api.post('/user/logout')
        },
    },
    room: {
        getMemberRoom() {
            return api.get('/room/memberroom')
        },
        getPrevioutMessage(id, messageId, pageSize) {
            return api.get(`/room/${id}/previousmessage`, { params: { messageId, pageSize } })
        },
    },
    getUpload(url) {
        if (!url) return '/images/default-avatar.jpg'
        return process.env.REACT_APP_API_URL + '/images/' + url
    },
}

export default webAPI

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import webAPI from '../api/webAPI'

const userSlice = createSlice({
    name: 'user',
    initialState: {
        loading: true,
        currentUser: null,
    },
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false
                state.currentUser = action.payload
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false
            })
    },
})

export const fetchCurrentUser = createAsyncThunk('user/fetchCurrentUser', async () => {
    try {
        const res = await webAPI.user.getCurrentUser()
        return res.data
    } catch (error) {
        const msg = error.response.data.message
        toast.error(msg)
        throw new Error(msg)
    }
})

export default userSlice

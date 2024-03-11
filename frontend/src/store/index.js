import { configureStore } from '@reduxjs/toolkit'
import userSlice from './userSlice'

const store = configureStore({
    reducer: { data: userSlice.reducer },
})

export default store

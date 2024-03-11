import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { fetchCurrentUser } from '../store/userSlice'
import socket from '../api/socket'

function PrivateRoute() {
    const { loading, currentUser } = useSelector((state) => state.data)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchCurrentUser())
        } else {
            socket.emit('join-room', currentUser._id)

            return () => socket.emit('leave-room', currentUser._id)
        }
    }, [dispatch, currentUser])

    if (!loading && !currentUser) return <Navigate to="/login" replace={true} />

    return loading ? <></> : <Outlet />
}

export default PrivateRoute

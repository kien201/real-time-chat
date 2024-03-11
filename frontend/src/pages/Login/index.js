import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import classnames from 'classnames/bind'

import style from './index.module.scss'
import webAPI from '../../api/webAPI'
import { fetchCurrentUser } from '../../store/userSlice'

const cx = classnames.bind(style)

function Login() {
    const [loginTab, setLoginTab] = useState(true)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [data, setData] = useState({
        fullName: '',
        username: '',
        password: '',
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setData((prev) => ({ ...prev, [name]: value }))
    }

    const handleLogin = async (e) => {
        try {
            const res = await webAPI.home.login(data)
            dispatch(fetchCurrentUser())
            toast.success(res.data.message)
            navigate('/')
        } catch (error) {
            toast.error(error)
        }
    }

    const handleRegister = async (e) => {
        try {
            const res = await webAPI.home.register(data)
            dispatch(fetchCurrentUser())
            toast.success(res.data.message)
            navigate('/')
        } catch (error) {
            toast.error(error)
        }
    }

    return (
        <div className={cx('content')}>
            <div className={cx('container')}>
                <div className={cx('form-header')}>
                    <button className={cx({ active: loginTab })} onClick={() => setLoginTab(true)}>
                        Đăng nhập
                    </button>
                    <button className={cx({ active: !loginTab })} onClick={() => setLoginTab(false)}>
                        Đăng ký
                    </button>
                </div>
                <div className={cx('form-body')}>
                    {!loginTab && (
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Họ tên"
                            value={data.fullName}
                            onChange={handleInputChange}
                        />
                    )}
                    <input
                        type="text"
                        name="username"
                        placeholder="Tài khoản"
                        value={data.username}
                        onChange={handleInputChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={data.password}
                        onChange={handleInputChange}
                    />
                    {loginTab && <button onClick={handleLogin}>Đăng nhập</button>}
                    {!loginTab && <button onClick={handleRegister}>Đăng ký</button>}
                </div>
            </div>
        </div>
    )
}

export default Login

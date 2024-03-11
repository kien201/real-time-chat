import React, { useCallback, useEffect, useState } from 'react'
import classnames from 'classnames/bind'

import style from './index.module.scss'
import webAPI from '../../api/webAPI'

const cx = classnames.bind(style)

const userQueryInit = {
    fullName: '',
    username: '',
    password: '',
}

function User() {
    const [users, setUsers] = useState([])
    const [userQuery, setUserQuery] = useState(userQueryInit)

    const fetchUsers = useCallback(async () => {
        try {
            const res = await webAPI.user.getAll()
            setUsers(res.data)
        } catch (error) {
            console.log(error)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleBtnAddClick = async () => {
        try {
            await webAPI.user.create(userQuery)
            setUserQuery(userQueryInit)
            fetchUsers()
        } catch (error) {
            console.log(error)
        }
    }

    const handleBtnEditClick = async (id) => {
        try {
            await webAPI.user.edit(id, userQuery)
            setUserQuery(userQueryInit)
            fetchUsers()
        } catch (error) {
            console.log(error)
        }
    }

    const handleBtnDeleteClick = async (id) => {
        try {
            await webAPI.user.delete(id)
            fetchUsers()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={cx('container')}>
            <h2 className={cx('title')}>Quản lý người dùng</h2>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
                <input
                    value={userQuery.fullName || ''}
                    onChange={(e) => setUserQuery((prev) => ({ ...prev, fullName: e.target.value }))}
                    type="text"
                    placeholder="Họ tên"
                />
                <input
                    value={userQuery.username || ''}
                    onChange={(e) => setUserQuery((prev) => ({ ...prev, username: e.target.value }))}
                    type="text"
                    placeholder="Tài khoản"
                />
                <input
                    value={userQuery.password || ''}
                    onChange={(e) => setUserQuery((prev) => ({ ...prev, password: e.target.value }))}
                    type="text"
                    placeholder="Mật khẩu"
                />
                <input
                    type="file"
                    name="avatar"
                    onChange={(e) => setUserQuery((prev) => ({ ...prev, avatar: e.target.files[0] }))}
                />
            </div>
            <button className={cx('btn-add')} onClick={handleBtnAddClick}>
                Thêm
            </button>
            <div className={cx('table-shadow')}>
                <table>
                    <thead className={cx('table-head')}>
                        <tr>
                            <th>Avatar</th>
                            <th>Họ tên</th>
                            <th>Tài khoản</th>
                            <th>Mật khẩu</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className={cx('table-body')}>
                        {users.map((user) => (
                            <tr key={user._id} onClick={() => setUserQuery({ ...user })}>
                                <td>
                                    <img className="avatar" src={webAPI.getUpload(user.avatar)} alt="err" />
                                </td>
                                <td>{user.fullName}</td>
                                <td>{user.username}</td>
                                <td>{user.password}</td>
                                <td>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleBtnEditClick(user._id)
                                        }}
                                        className={cx('btn-edit')}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleBtnDeleteClick(user._id)
                                        }}
                                        className={cx('btn-delete')}
                                    >
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default User

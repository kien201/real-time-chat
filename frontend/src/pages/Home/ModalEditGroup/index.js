import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import classnames from 'classnames/bind'
import { CgCloseR } from 'react-icons/cg'
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from 'react-icons/io'

import style from './index.module.scss'
import webAPI from '../../../api/webAPI'
import socket from '../../../api/socket'
import { useSelector } from 'react-redux'

const cx = classnames.bind(style)

const groupDataInit = {
    name: '',
    members: [],
}

function ModalEditGroup({ groupData, closeModalEditGroup = () => {} }) {
    const currentUser = useSelector((state) => state.data.currentUser)
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState([])
    const [group, setGroup] = useState(groupDataInit)

    useEffect(() => {
        if (groupData) setGroup(groupData)
        else setGroup(groupDataInit)
    }, [groupData])

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const res = await webAPI.user.findByName(searchQuery)
            setUsers(res.data.filter((user) => user._id !== currentUser._id))
        }, 1000)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, currentUser])

    const handleBtnSaveClick = () => {
        const roomInfo = {
            hasRoom: !!group._id,
            _id: group._id,
            name: group.name,
            members: group.members.map((member) => member._id),
        }
        if (!roomInfo.hasRoom) roomInfo.members.push(currentUser._id)

        socket.emit('edit-room', roomInfo)
        closeModalEditGroup()
        toast.success('Lưu thành công')
    }

    return (
        <div className="modal">
            <div className={cx('modal-container')}>
                <div className={cx('modal-header')}>
                    <input
                        type="text"
                        placeholder="Tên nhóm"
                        value={group.name}
                        onChange={(e) => setGroup((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <button onClick={closeModalEditGroup}>
                        <CgCloseR />
                    </button>
                </div>
                <div className={cx('modal-body')}>
                    <div className={cx('container-header')}>
                        <h3>Thành viên</h3>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            type="text"
                            placeholder="Tìm kiếm..."
                        />
                    </div>
                    <div className={cx('container-body')}>
                        <div className={cx('user-list')}>
                            <div className={cx('wrapper')}>
                                {group.members
                                    .filter((member) => member._id !== currentUser._id)
                                    .map((member) => (
                                        <div key={member._id} className={cx('user-item')}>
                                            <img className="avatar" src={webAPI.getUpload(member.avatar)} alt="err" />
                                            <span>{member.fullName}</span>
                                            <button
                                                onClick={(e) =>
                                                    setGroup((prev) => ({
                                                        ...prev,
                                                        members: prev.members.filter((m) => m._id !== member._id),
                                                    }))
                                                }
                                            >
                                                <IoIosRemoveCircleOutline />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className={cx('user-list')}>
                            <div className={cx('wrapper')}>
                                {users
                                    .filter((user) => !group.members.some((member) => member._id === user._id))
                                    .map((user) => (
                                        <div key={user._id} className={cx('user-item')}>
                                            <img className="avatar" src={webAPI.getUpload(user.avatar)} alt="err" />
                                            <span>{user.fullName}</span>
                                            <button
                                                onClick={(e) =>
                                                    setGroup((prev) => ({
                                                        ...prev,
                                                        members: [...prev.members, user],
                                                    }))
                                                }
                                            >
                                                <IoIosAddCircleOutline />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cx('modal-footer')}>
                    <button onClick={handleBtnSaveClick}>Lưu</button>
                </div>
            </div>
        </div>
    )
}

export default ModalEditGroup

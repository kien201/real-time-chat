import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import classnames from 'classnames/bind'
import { AiOutlineUsergroupAdd } from 'react-icons/ai'
import { CgCloseR } from 'react-icons/cg'

import style from './index.module.scss'
import webAPI from '../../../api/webAPI'
import socket from '../../../api/socket'
import dateUtil from '../../../utils/dateUtil'

const cx = classnames.bind(style)

function ContentLeft({ chatData, handleBtnRoomClick = () => {}, handleBtnEditGroupClick = () => {} }) {
    const currentUser = useSelector((state) => state.data.currentUser)

    const [isSearching, setIsSearching] = useState(false)
    const [rooms, setRooms] = useState([])
    const [users, setUsers] = useState([])

    const [queryUser, setQueryUser] = useState('')

    useEffect(() => {
        ;(async () => {
            const res = await webAPI.room.getMemberRoom()
            setRooms(res.data)
        })()

        const handleReceiveRoomUpdate = (roomData) => {
            setRooms((prev) => {
                if (prev.some((room) => room._id === roomData._id)) {
                    return prev.map((room) => {
                        if (room._id === roomData._id) {
                            return { ...roomData, messages: [...room.messages, ...roomData.messages] }
                        }
                        return room
                    })
                } else {
                    return [roomData, ...prev]
                }
            })
        }
        socket.on('receive-room-update', handleReceiveRoomUpdate)
        return () => socket.off('receive-room-update', handleReceiveRoomUpdate)
    }, [])

    useEffect(() => {
        if (queryUser.trim().length > 2) {
            const timeoutId = setTimeout(async () => {
                const res = await webAPI.user.findByName(queryUser)
                setUsers(res.data.filter((user) => user._id !== currentUser._id))
            }, 1000)
            return () => clearTimeout(timeoutId)
        }
    }, [queryUser, currentUser])

    const renderRoomList = () => {
        if (isSearching) {
            return users.map((user) => {
                const userRoom = rooms.find(
                    (room) => room.type === 'chat' && room.members.some((member) => member._id === user._id)
                )
                const lastComment = userRoom?.messages[userRoom.messages.length - 1]

                return (
                    <button
                        key={user._id}
                        className={cx('room-item', {
                            active:
                                user._id === chatData?.user?._id || (userRoom && userRoom._id === chatData?.room?._id),
                        })}
                        onClick={() => {
                            if (userRoom) handleBtnRoomClick({ room: userRoom })
                            else handleBtnRoomClick({ user })
                        }}
                    >
                        <img className="avatar" src={webAPI.getUpload(user.avatar)} alt="err" />
                        <div className={cx('room-info')}>
                            <div className={cx('room-title')}>
                                <h4>{user.fullName}</h4>
                                {lastComment && (
                                    <span className={cx('text-sm')}>
                                        {dateUtil.dynamicFormat(lastComment.sendTime)}
                                    </span>
                                )}
                            </div>
                            {lastComment && <p className={cx('room-content', 'text-sm')}>{lastComment.content}</p>}
                        </div>
                    </button>
                )
            })
        } else {
            return sortedRoom.map((room) => {
                let Avatar
                let roomName = 'Người dùng'
                if (room.type === 'chat') {
                    const member = room.members.find((member) => member._id !== currentUser._id)
                    Avatar = <img className="avatar" src={webAPI.getUpload(member?.avatar)} alt="err" />
                    roomName = member?.fullName
                } else {
                    Avatar = (
                        <div className={cx('avatar-group')}>
                            {room.members.slice(-3).map((member) => (
                                <img key={member._id} src={webAPI.getUpload(member?.avatar)} alt="err" />
                            ))}
                            <span className={cx('text-sm')}>
                                {room.members.length < 100 ? room.members.length : '99+'}
                            </span>
                        </div>
                    )
                    roomName = room.name
                }
                const lastComment = room.messages[room.messages.length - 1]

                return (
                    <button
                        key={room._id}
                        className={cx('room-item', { active: room._id === chatData?.room?._id })}
                        onClick={() => {
                            handleBtnRoomClick({ room })
                        }}
                    >
                        {Avatar}
                        <div className={cx('room-info')}>
                            <div className={cx('room-title')}>
                                <h4>{roomName}</h4>
                                {lastComment && (
                                    <span className={cx('text-sm')}>
                                        {dateUtil.dynamicFormat(lastComment.sendTime)}
                                    </span>
                                )}
                            </div>
                            {lastComment && <p className={cx('room-content', 'text-sm')}>{lastComment.content}</p>}
                        </div>
                    </button>
                )
            })
        }
    }

    const sortedRoom = [...rooms]
    sortedRoom.sort((a, b) => {
        if (a.messages?.length > 0 && b.messages?.length > 0) {
            const aSendTime = new Date(a.messages[a.messages.length - 1].sendTime)
            const bSendTime = new Date(b.messages[b.messages.length - 1].sendTime)
            return bSendTime - aSendTime
        }
        return 0
    })
    return (
        <div className={cx('content-left')}>
            <div className={cx('search-bar')}>
                <input
                    value={queryUser}
                    onChange={(e) => setQueryUser(e.target.value)}
                    type="text"
                    placeholder="Tìm kiếm..."
                    onFocus={(e) => setIsSearching(true)}
                />
                {isSearching && (
                    <button
                        onClick={(e) => {
                            setIsSearching(false)
                            setQueryUser('')
                            setUsers([])
                        }}
                    >
                        <CgCloseR />
                    </button>
                )}
                <button onClick={() => handleBtnEditGroupClick(null)}>
                    <AiOutlineUsergroupAdd />
                </button>
            </div>
            <div className={cx('room-list')}>
                <div className={cx('room-wrapper')}>
                    {isSearching && queryUser.trim().length <= 2 && users.length === 0 && (
                        <h4 className={cx('query-length-require')}>Hãy nhập ít nhất 3 ký tự...</h4>
                    )}
                    {renderRoomList()}
                </div>
            </div>
        </div>
    )
}

export default ContentLeft

import React, { useEffect, useRef, useState } from 'react'
import classnames from 'classnames/bind'
import { IoSend, IoArrowDownCircleOutline } from 'react-icons/io5'
import { LuUserPlus2 } from 'react-icons/lu'
import { CgCloseR } from 'react-icons/cg'
import { useSelector } from 'react-redux'

import style from './index.module.scss'
import socket from '../../../api/socket'
import dateUtil from '../../../utils/dateUtil'
import webAPI from '../../../api/webAPI'

const cx = classnames.bind(style)

function ContentRight({
    chatData,
    setChatData = () => {},
    handleBtnCloseClick = () => {},
    handleBtnEditGroupClick = () => {},
}) {
    const currentUser = useSelector((state) => state.data.currentUser)
    const inputMessageRef = useRef()
    const [message, setMessage] = useState('')
    const chatEndRef = useRef()
    const [isScrollToEnd, setIsScrollToEnd] = useState(true)
    const prevScrollValue = useRef(null)
    const chatRef = useRef()

    useEffect(() => {
        if (isScrollToEnd) {
            chatEndRef.current?.scrollIntoView({ behavior: 'instant' })
        } else {
            if (prevScrollValue.current?.scrollTop === 0) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight - prevScrollValue.current.scrollHeight
                prevScrollValue.current = null
            }
        }
    }, [chatData, isScrollToEnd])

    const handleChatScroll = async (e) => {
        try {
            const { scrollTop, scrollHeight, clientHeight } = e.target
            if (scrollTop + clientHeight + 10 > scrollHeight) {
                !isScrollToEnd && setIsScrollToEnd(true)
            } else {
                isScrollToEnd && setIsScrollToEnd(false)
            }

            const pageSize = 20
            if (scrollTop === 0 && chatData.room && chatData.room.messages.length >= pageSize) {
                const messageId = chatData.room.messages[0]._id
                const res = await webAPI.room.getPrevioutMessage(chatData.room._id, messageId, pageSize)
                setChatData((prev) => ({
                    ...prev,
                    room: { ...prev.room, messages: [...res.data, ...prev.room.messages] },
                }))
                prevScrollValue.current = { scrollTop, scrollHeight, clientHeight }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (message.trim().length > 0) {
            if (chatData.room || chatData.user) {
                const hasRoom = !!chatData.room
                const data = {
                    hasRoom: hasRoom,
                    senderId: currentUser._id,
                    receiverId: hasRoom ? chatData.room._id : chatData.user._id,
                    message,
                }
                socket.emit('send-message', data)
                setIsScrollToEnd(true)
                inputMessageRef.current.focus()
                setMessage('')
            }
        }
    }

    const renderChatHeader = () => {
        const room = chatData.room
        let Avatar
        let roomName = 'Người dùng'
        if (room) {
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
                        <span className={cx('text-sm')}>{room.members.length < 100 ? room.members.length : '99+'}</span>
                    </div>
                )
                roomName = room.name
            }
        } else {
            Avatar = <img className="avatar" src={webAPI.getUpload(chatData.user?.avatar)} alt="err" />
            roomName = chatData.user?.fullName
        }

        return (
            <>
                {Avatar}
                <h3 className={cx('chat-title')}>{roomName}</h3>
            </>
        )
    }

    if (!chatData) return <div className={cx('content-right')}></div>
    return (
        <div className={cx('content-right')}>
            <div className={cx('chat-header')}>
                {renderChatHeader()}
                {chatData.room?.type === 'group' && (
                    <button onClick={() => handleBtnEditGroupClick(chatData.room)}>
                        <LuUserPlus2 />
                    </button>
                )}
                <button onClick={handleBtnCloseClick}>
                    <CgCloseR />
                </button>
            </div>
            <div className={cx('chat-content')}>
                <div ref={chatRef} className={cx('chat-wrapper')} onScroll={handleChatScroll}>
                    {chatData.room &&
                        chatData.room.messages.map((message) => {
                            const isCurrentUserSend = message.sender._id === currentUser._id
                            return (
                                <div key={message._id} className={cx('message-wrapper', { send: isCurrentUserSend })}>
                                    {!isCurrentUserSend && (
                                        <img
                                            className={cx('avatar')}
                                            src={webAPI.getUpload(message.sender.avatar)}
                                            alt="err"
                                        />
                                    )}
                                    <div className={cx('message')}>
                                        {!isCurrentUserSend && (
                                            <p className={cx('text-sm')}>{message.sender.fullName}</p>
                                        )}
                                        <p>{message.content}</p>
                                        <p className={cx('text-sm')}>{dateUtil.dynamicFormat(message.sendTime)}</p>
                                    </div>
                                </div>
                            )
                        })}
                    <div ref={chatEndRef} />
                </div>
                {!isScrollToEnd && (
                    <button className={cx('btn-scroll-to-end')} onClick={(e) => setIsScrollToEnd(true)}>
                        <IoArrowDownCircleOutline />
                    </button>
                )}
            </div>
            <form onSubmit={handleSendMessage}>
                <div className={cx('chat-footer')}>
                    <label className={cx('chat-input')}>
                        <input
                            ref={inputMessageRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            type="text"
                            placeholder="Nhập tin nhắn"
                        />
                    </label>
                    <div className={cx('chat-button')}>
                        <button type="submit">
                            <IoSend />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ContentRight

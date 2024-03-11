import React, { useEffect, useState } from 'react'
import classnames from 'classnames/bind'

import style from './index.module.scss'
import ContentLeft from './ContentLeft'
import ContentRight from './ContentRight'
import socket from '../../api/socket'
import ModalEditGroup from './ModalEditGroup'

const cx = classnames.bind(style)

function Home() {
    const [chatData, setChatData] = useState(null)

    const [modalEditGroup, setModalEditGroup] = useState({
        isOpen: false,
        data: null,
    })

    useEffect(() => {
        const handleReceiveRoomUpdate = (roomData) => {
            setChatData((prev) => {
                if (prev) {
                    if (!prev.room) return { ...prev, room: roomData }
                    if (prev.room._id === roomData._id) {
                        const room = { ...roomData, messages: [...prev.room.messages, ...roomData.messages] }
                        return { ...prev, room }
                    }
                }
                return prev
            })
        }
        socket.on('receive-room-update', handleReceiveRoomUpdate)
        return () => socket.off('receive-room-update', handleReceiveRoomUpdate)
    }, [])

    const handleBtnRoomClick = (data) => {
        setChatData(data)
    }

    const handleBtnCloseClick = () => {
        setChatData(null)
    }

    const handleBtnEditGroupClick = (group) => {
        setModalEditGroup((prev) => ({ ...prev, isOpen: true, data: group }))
    }

    const closeModalEditGroup = () => {
        setModalEditGroup((prev) => ({ ...prev, isOpen: false }))
    }

    return (
        <div className={cx('container')}>
            <ContentLeft
                chatData={chatData}
                handleBtnRoomClick={handleBtnRoomClick}
                handleBtnEditGroupClick={handleBtnEditGroupClick}
            />
            <ContentRight
                chatData={chatData}
                setChatData={setChatData}
                handleBtnCloseClick={handleBtnCloseClick}
                handleBtnEditGroupClick={handleBtnEditGroupClick}
            />
            {modalEditGroup.isOpen && (
                <ModalEditGroup groupData={modalEditGroup.data} closeModalEditGroup={closeModalEditGroup} />
            )}
        </div>
    )
}

export default Home

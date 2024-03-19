"use client";

import React, { useEffect, useState } from 'react'
import { BiLogOut } from 'react-icons/bi'
import { auth, db } from '../../../firebase'
import { Timestamp, addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { useAppContext } from '@/context/AppContext';

const Sidebar = () => {
const { user, userId, setSelectedRoom, setSelectRoomName } = useAppContext();

  const [rooms, setRooms] = useState<Room[]>([]);

  type Room = {
    id: string;
    name: string;
    createdAt: Timestamp;
  }

  useEffect(() => {
    if(userId) {
      const fetchRooms = async () => {
        const roomCollectionRef = collection(db, "rooms");
        const q = query(roomCollectionRef, where("userId", "==", userId),orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newRooms: Room[] = snapshot.docs.map((doc) => ({
            id: doc.id, 
            name: doc.data().name,
            createdAt: doc.data().createdAt,
          }));
          setRooms(newRooms);
        });
        return () => {
          unsubscribe();
        }
      };
      fetchRooms();
    }
  }, [userId])

  const selectRoom = (roomId: string, roomName: string) => {
    setSelectedRoom(roomId);
    setSelectRoomName(roomName);
  };

  const addNewRoom = async () => {
    const roomName = prompt("Please enter the room name");
    if(roomName) {
      const newRoomRef = collection(db, "rooms");
      await addDoc(newRoomRef, {
        name: roomName,
        userId: userId,
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className='h-full overflow-y-auto px-5 flex flex-col bg-custom-blue'>
        <div className='flex-grow'>
            <div 
            onClick={addNewRoom}
            className='flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-800 duration-150'>
                <span className='text-white p-4 text-2xl'>+</span>
                <h1 className='text-white text-xl font-semibold p-4'>New Chat</h1>
        </div>
            <ul>
              {rooms.map((room) => (
                <li 
                key={room.id} 
                onClick={() => selectRoom(room.id, room.name)}
                className='cursor-pointer border-b p-4 text-slate-100 hover:bg-slate-700 duration-150'>{room.name}</li>
              ))}
            </ul>
        </div>
        {user && (<div className='mb-2 p-4 text-slate-100 text-lg font-medium'>{user.email}</div>)}
        <div 
        onClick={() => handleLogout()}
        className='flex items-center justify-evenly mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-150'>
          <BiLogOut />
          <span>LogOut</span>
        </div>
    </div>
  )
}

export default Sidebar
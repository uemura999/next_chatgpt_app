"use client";

import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import { db } from '../../../firebase';
import { useAppContext } from '@/context/AppContext';
import OpenAI from 'openai';
import LoadingIcons from 'react-loading-icons';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
}

const Chat = () => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    dangerouslyAllowBrowser: true,
  });

  const { selectedRoom, selectRoomName } = useAppContext();
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollDiv = useRef<HTMLDivElement>(null);

  //Fetch the messages in each room
  useEffect(() => {
    if(selectedRoom) {
    const fetchMessages = async () => {
      const roomDocRef = doc(db, "rooms", selectedRoom);
      const messagesCollectionRef = collection(roomDocRef, "messages");

      const q = query(messagesCollectionRef, orderBy("createdAt"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
        setMessages(newMessages);
      });

      return () => {
        unsubscribe();
      };
    };
    fetchMessages();
  }
  }, [selectedRoom]);

  useEffect(() => {
    if(scrollDiv.current) {
      const element = scrollDiv.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if(!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage, 
      sender: "user",
      createdAt: serverTimestamp()
    }
    //Save the message to the firestore
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(roomDocRef, "messages");
    await addDoc(messageCollectionRef, messageData);
    setInputMessage(''); // Clear the input field after sending the message
    setIsLoading(true);
    //Reply from the OpenAI
    const gpt3Response = await openai.chat.completions.create({
      messages: [{role: "user", content: inputMessage}],
      model: "gpt-3.5-turbo",
    });
    const botResponse = gpt3Response.choices[0].message.content;
    setIsLoading(false);
    await addDoc(messageCollectionRef, {
      text: botResponse,
      sender: "bot",
      createdAt: serverTimestamp(),
    });
  };
  
  //key=indexはメッセージを並び替えたり削除したりするなら禁止
  return (
    <div className='bg-gray-500 h-full p-4 flex flex-col'>
        <h1 className='text-2xl text-white font-semibold mb-4'>{selectRoomName}</h1>
        <div className='flex-grow overflow-y-auto mb-4' ref={scrollDiv}>   
          {messages.map((message, index) => (
            <div key={index} className={message.sender === "user" ? 'text-right' : 'text-left'}> 
              <div className={message.sender === "user" ? 'bg-blue-500 inline-block rounded px-4 py-2 mb-2' : 'bg-green-500 inline-block rounded px-4 py-2 mb-2'}>
                <p className='text-white'>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        {isLoading && <div className='p-2'><LoadingIcons.SpinningCircles size={2} /></div>}
        {selectedRoom && (
          <div className='flex-shrink-0 relative'>
          <input 
          onChange={(e) => setInputMessage(e.target.value)}
          type="text" 
          placeholder='Send a Message' 
          className='border-2 rounded w-full pr-10 focus:outline-none p-2' 
          value={inputMessage} // Bind the input field to the inputMessage state
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className='absolute right-4 flex items-center inset-y-0' onClick={() => sendMessage()}>
            <FaPaperPlane  />
          </button>
        </div>
        )}
        
    </div>
  )
}

export default Chat
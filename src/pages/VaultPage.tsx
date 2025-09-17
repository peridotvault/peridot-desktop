// @ts-ignore
import React, { useEffect, useState } from 'react';
import { VerticalCard } from '../components/cards/VerticalCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { AppInterface } from '../interfaces/app/AppInterface';
import { getAllPublishApps } from '../blockchain/icp/app/services/ICPAppService';

export default function VaultPage() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isHoverComponent, setIsHoverComponent] = useState(false);
  const [allApps, setAllApps] = useState<AppInterface[] | null>();
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const images: string[] = [
    './assets/vault/Content1.png',
    './assets/vault/Content2.png',
    './assets/vault/Content3.png',
  ];

  useEffect(() => {
    async function fetchData() {
      window.scrollTo(0, 0);

      const resAllGames = await getAllPublishApps();
      console.log(resAllGames);
      setAllApps(resAllGames);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!isHoverComponent) {
      const id = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [isHoverComponent, images.length]);

  const handleMouseEnter = (index: number) => {
    setIsHoverComponent(true);
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setIsHoverComponent(false);
  };

  async function onKeyDown(e: any) {
    if (e.key === 'Enter' && !loading) {
      console.log(input);
      e.preventDefault();
    }
  }

  return (
    <main className="flex flex-col gap-3">
      <div className="z-50">
        {/* Chat Window */}
        <div
          className={`fixed bottom-32 right-12 w-[448px] bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          {/* Chat Header */}
          <div className="bg-accent_secondary text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 className="font-bold text-lg">Peri</h3>
            <button onClick={toggleChat} className="hover:opacity-75">
              Close
            </button>
          </div>

          {/* Message Area */}
          <div className="p-4 h-96 overflow-y-auto flex flex-col space-y-4">
            {/* Example Messages */}
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">
                Hi there! How can I help you today?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-accent_secondary text-white p-3 rounded-lg max-w-xs">
                I have a question about my order.
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={loading ? 'Thinking...' : 'Type your message...'}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent_secondary text-black"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                disabled={loading}
                onKeyDown={onKeyDown}
              />
            </div>
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={toggleChat}
          className="fixed bottom-12 right-12 bg-accent_secondary font-bold text-white rounded-full w-40 py-4 shadow-lg hover:bg-accent_secondary/70 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent_primary"
          aria-label="Toggle Chat"
        >
          {isOpen ? <p>Close</p> : <p>Chat with Peri</p>}
        </button>
      </div>

      {/* section 1  */}
      <section className="w-full h-[30rem] pt-20 mb-4 relative">
        <img src="https://i.imgur.com/ZlbIhY2.gif" alt="" className="w-full h-full object-cover" />
        <div className="w-full h-16 absolute bottom-0 bg-gradient-to-t from-background_primary"></div>
      </section>

      {/* section 2  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex gap-6 xl:gap-12 duration-300 w-full container">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-1/3 aspect-video rounded-xl bg-background_primary overflow-hidden duration-300 flex items-center justify-center 
          ${activeIndex === index ? 'scale-105 opacity-100 shadow-flat' : 'scale-100 opacity-70'}
        `}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave()}
            >
              <img src={image} alt="" className="w-full h-full object-cover rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* section 3  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">Black Friday - Cyber Monday Spotlight</p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

          {/* contents  */}
          <div className="flex gap-6">
            {allApps?.slice(0, 5).map((item) => (
              <VerticalCard
                key={item.appId}
                appId={BigInt(item.appId)}
                imgUrl={item.coverImage}
                title={item.title}
                price={BigInt(item.price)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* section 4  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6  w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">Black Friday - Cyber Monday Spotlight</p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

          {/* contents  */}
          <div className="flex gap-6">
            {allApps?.slice(0, 5).map((item) => (
              <VerticalCard
                key={item.appId}
                appId={BigInt(item.appId)}
                imgUrl={item.coverImage}
                title={item.title}
                price={BigInt(item.price)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

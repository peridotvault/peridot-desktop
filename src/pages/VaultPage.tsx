// @ts-ignore
import React, { useEffect, useState } from "react";
import { VerticalCard } from "../components/cards/VerticalCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";

export default function VaultPage() {
  // Components
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isHoverComponent, setIsHoverComponent] = useState(false);

  const images: string[] = [
    "./assets/vault/Content1.png",
    "./assets/vault/Content2.png",
    "./assets/vault/Content3.png",
  ];

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

  return (
    <main className="flex flex-col gap-3">
      {/* section 1  */}
      <section className="w-full h-[30rem] pt-20 mb-4 relative">
        <img
          src="https://i.imgur.com/ZlbIhY2.gif"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="w-full h-16 absolute bottom-0 bg-gradient-to-t from-background_primary"></div>
      </section>

      {/* section 2  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex gap-6 xl:gap-12 duration-300 w-full container">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-1/3 aspect-video rounded-xl bg-background_primary overflow-hidden duration-300 flex items-center justify-center 
          ${
            activeIndex === index
              ? "scale-105 opacity-100 shadow-flat"
              : "scale-100 opacity-70"
          }
        `}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave()}
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      </section>

      {/* section 3  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">
              Black Friday - Cyber Monday Spotlight
            </p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

          {/* contents  */}
          <div className="flex gap-6">
            <VerticalCard
              imgUrl="https://image.api.playstation.com/vulcan/ap/rnd/202409/2013/96a84262e4562c459c213515a9dfd53d82547603b86a2c6a.png"
              title="Lego Horizon Adventures"
              price={879000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLMvJe1GUTrDd-_hB5qNvvgCQyALn9rnwheg&s"
              title="Necroking"
              price={47000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdp_ZPzOzPD_xMZ7CIAEQj5EPocc3ix3DxvQ&s"
              title="The Casting of Frank Stone™ Deluxe Edition"
              price={415000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwgCR-vS9eaaZlau4l5dRX0ct-oQq25RIsTg&s"
              title="Star Wars Outlaws Gold"
              price={1269000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwgCR-vS9eaaZlau4l5dRX0ct-oQq25RIsTg&s"
              title="Star Wars Outlaws Gold"
              price={0}
            />
          </div>
        </div>
      </section>

      {/* section 4  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6  w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">
              Black Friday - Cyber Monday Spotlight
            </p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

          {/* contents  */}
          <div className="flex gap-6">
            <VerticalCard
              imgUrl="https://image.api.playstation.com/vulcan/ap/rnd/202409/2013/96a84262e4562c459c213515a9dfd53d82547603b86a2c6a.png"
              title="Lego Horizon Adventures"
              price={879000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLMvJe1GUTrDd-_hB5qNvvgCQyALn9rnwheg&s"
              title="Necroking"
              price={47000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwgCR-vS9eaaZlau4l5dRX0ct-oQq25RIsTg&s"
              title="Star Wars Outlaws Gold"
              price={1269000}
            />
            <VerticalCard
              imgUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdp_ZPzOzPD_xMZ7CIAEQj5EPocc3ix3DxvQ&s"
              title="The Casting of Frank Stone™ Deluxe Edition"
              price={415000}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

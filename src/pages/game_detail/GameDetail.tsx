// @ts-ignore
import React, { useState } from "react";
import { StarComponent } from "../../components/atoms/StarComponent";
import { VerticalCard } from "../../components/cards/VerticalCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";

export default function GameDetail() {
  const [price] = useState(30000);
  return (
    <main className="flex justify-center duration-300">
      <div className="max-w-[1400px] w-full flex flex-col gap-6 duration-300">
        <div className="mb-20"></div>
        {/* title */}
        <div className="px-12 py-6 flex flex-col gap-3">
          <p className="text-3xl font-bold">Assassin Creed</p>
          <StarComponent rate={4} />
        </div>
        {/* First Section */}
        <section className="px-12 py-6 flex gap-12 lg:gap-14 duration-300">
          {/* Left side ======================== */}
          <div className="w-3/4 flex flex-col gap-12 text-lg">
            {/* overview */}
            <img
              src="/assets/cover1.png"
              alt=""
              className="aspect-video rounded-xl shadow-arise-sm "
            />
            {/* section 1 */}
            <p>
              Get ready for the apocalypse! Shatterline is an intense FPS with
              roguelike co-op PVE and PVP modes. Pick a unique operator,
              customize your look and weapons, and combat the alien plague!
            </p>
            <section className="flex flex-col gap-6 ">
              <p className="text-xl font-bold">Get ready for the apocalypse!</p>
              <p>
                Welcome to Shatterline - ground zero for the apocalypse. Are you
                ready?
              </p>
              <p>
                Shatterline is a fierce, intense multiplayer FPS, offering
                roguelike co-op PVE modes as well as competitive PvP modes.
                Immerse yourself in a world of explosive action; smooth,
                satisfying gunplay; wild customizations; and a striking
                landscape full of secrets, rewards, and deadly opponents.
              </p>
              <p>
                A mysterious interstellar object has exploded near Earth,
                sending massive, jagged shards smashing into our planet’s
                surface - turning thriving cities into toxic craters and leaving
                millions dead.
              </p>
              <p>
                From this destruction, a new horror has risen: an alien
                contaminant called “Crystalline” that tears apart geomagnetic
                fields and transforms living flesh to razor-edged silica. And
                it’s spreading.
              </p>
            </section>
          </div>
          {/* right side ======================== */}
          <div className="w-1/4 min-w-[300px] h-52 flex flex-col gap-6">
            {/* age regulation  */}
            <div className="flex items-center justify-center ">
              <div className="w-full aspect-video relative overflow-hidden shadow-arise-sm rounded-xl">
                <img
                  src="/assets/cover1.png"
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            </div>
            {/* age regulation  */}
            <div className="flex shadow-arise-sm p-6 rounded-xl items-start gap-4 ">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQll4aojWlhPmKpt6mBEgv1HSk55vIHpG92aY3w-zTsmTUwGs7bv31r8qluHXf6g1SezkY&usqp=CAU"
                alt=""
                className="w-10 object-contain"
              />
              <div className="flex flex-col gap-2">
                <p className="font-bold">Everyone</p>
                <hr className="border-text_disabled/50" />
                <p>
                  A safe game for all, although it may contain some mild
                  violence or more complex themes.
                </p>
              </div>
            </div>
            {/* details game  */}
            <div className="flex flex-col">
              <GameTypes title="Developer" content="Antigane Studio" />
              <GameTypes title="Publisher" content="Antigane Inc." />
              <GameTypes title="Release Date" content="12/05/24" />
              <GameTypes title="Requirement" content="RAM 16GB / 256GB" />
              <GameTypes title="Platform" content="Windows" />
            </div>
            {/* Buy Game  */}
            <div className="flex flex-col gap-4 py-3">
              {price <= 0 ? (
                <div className="flex gap-2 items-center text-start text-lg font-bold">
                  <p>FREE</p>
                </div>
              ) : (
                <div className="flex gap-2 items-center text-start">
                  <img
                    src="/assets/coin-peridot.png"
                    className="h-6 aspect-square object-contain"
                  />
                  <p className="text-lg">{price.toLocaleString()} PER /</p>
                  <p className="opacity-80">IDR {(1045800).toLocaleString()}</p>
                </div>
              )}

              <button className="w-full p-4 rounded-xl bg-accent_secondary ">
                Buy Now
              </button>
              <button className="w-full p-4 rounded-xl shadow-sunken-sm hover:shadow-arise-sm duration-300">
                Add To Cart
              </button>
              <button className="w-full p-4 rounded-xl shadow-sunken-sm hover:shadow-arise-sm duration-300">
                Add To Wishlist
              </button>
            </div>
          </div>
        </section>

        {/* Similar Games  */}
        <section className="flex justify-center px-12 py-6">
          <div className="flex flex-col gap-6 w-full max-w-[1400px]">
            {/* title  */}
            <button className="flex items-center gap-3">
              <p className="text-xl font-semibold">Similar Games</p>
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
                price={0}
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
            </div>
          </div>
        </section>
        <div className="mb-20"></div>
      </div>
    </main>
  );
}

const GameTypes = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between py-4">
        <p className="text-text_disabled">{title}</p>
        <p>{content}</p>
      </div>
      <hr className="border-text_disabled/50" />
    </div>
  );
};

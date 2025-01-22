// @ts-ignore
import React from "react";
import {
  faCircleNotch,
  faDollarSign,
  faEdit,
  faGun,
  faPaw,
  faShirt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export const Profile = () => {
  return (
    <main className="pt-20 flex flex-col items-center mb-10">
      <div className="container flex gap-6 mt-6">
        {/* left   ============================ */}
        <div className="w-2/3 flex flex-col gap-6">
          <section className="p-6 bg-background_primary rounded-3xl shadow-arise-sm">
            {/* cover  */}
            <div className="w-full h-[11rem]">
              <img
                src="https://img.lovepik.com/bg/20240325/Metaverse-NFT-Land-for-Sale-Stunning-3D-Illustration-of-the_5580347_wh1200.jpg"
                className="w-full h-[15rem] object-cover rounded-t-2xl rounded-b-[5rem] "
                alt=""
              />
            </div>
            {/* profile  */}
            <div className="px-20 relative flex items-end gap-6">
              <div className="w-36 h-36 bg-background_primary shadow-2xl rounded-full z-10 overflow-hidden p-2">
                <img
                  src="https://cdn.antaranews.com/cache/1200x800/2022/03/19/WhatsApp-Image-2022-03-19-at-09.29.12.jpeg"
                  className="w-full h-full object-cover rounded-full"
                  alt=""
                />
              </div>
              <div className="flex flex-col">
                <div className="flex gap-2 items-center">
                  <p className="font-bold text-2xl">Gamer.89Max</p>
                  <Link to="/create_profile">
                    <FontAwesomeIcon icon={faEdit} />
                  </Link>
                </div>
                <p className="text-text_disabled text-lg">Black Samurai</p>
              </div>
            </div>
            {/* achievements  */}
            <div className="mt-7 flex gap-8 justify-center px-20">
              {/* number 1  */}
              <div className="flex flex-col items-center gap-2 w-[75px]">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="text-3xl mb-4"
                />
                <progress
                  value="70"
                  max="100"
                  className="h-1 w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-background_disabled [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-background_disabled"
                ></progress>
                <p className="">70%</p>
              </div>
              {/* number 2  */}
              <div className="flex flex-col items-center gap-2 w-[75px]">
                <FontAwesomeIcon icon={faGun} className="text-3xl mb-4" />
                <progress
                  value="70"
                  max="100"
                  className="h-1 w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-background_disabled [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-background_disabled"
                ></progress>
                <p className="">70%</p>
              </div>
              {/* number 3  */}
              <div className="flex flex-col items-center gap-2 w-[75px]">
                <FontAwesomeIcon icon={faShirt} className="text-3xl mb-4" />
                <progress
                  value="30"
                  max="100"
                  className="h-1 w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-background_disabled [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-background_disabled"
                ></progress>
                <p className="">30%</p>
              </div>
              {/* number 4  */}
              <div className="flex flex-col items-center gap-2 w-[75px]">
                <FontAwesomeIcon icon={faPaw} className="text-3xl mb-4" />
                <progress
                  value="30"
                  max="100"
                  className="h-1 w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-background_disabled [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-background_disabled"
                ></progress>
                <p className="">30%</p>
              </div>
              {/* number 4  */}
              <div className="flex flex-col items-center gap-2 w-[75px]">
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="text-3xl mb-4"
                />
                <progress
                  value="30"
                  max="100"
                  className="h-1 w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-background_disabled [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-background_disabled"
                ></progress>
                <p className="">30%</p>
              </div>
            </div>
          </section>
          <section className="flex gap-6">
            <div className="w-1/3 bg-background_primary shadow-arise-sm aspect-square rounded-3xl"></div>
            <div className="w-1/3 bg-background_primary shadow-arise-sm aspect-square rounded-3xl"></div>
            <div className="w-1/3 bg-background_primary shadow-arise-sm aspect-square rounded-3xl"></div>
          </section>
        </div>
        {/* right  ============================ */}
        <div className="w-1/3 flex flex-col gap-6">
          <section className="aspect-[3/4] rounded-3xl overflow-hidden shadow-flat-sm">
            <img
              src="https://i.pinimg.com/736x/e0/c1/11/e0c1114baf11244075041ea00cfca531.jpg"
              className="w-full h-full object-cover"
              alt=""
            />
          </section>
        </div>
      </div>
    </main>
  );
};

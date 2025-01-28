// @ts-ignore
import React, { useState } from "react";
import {
  faClock,
  faCode,
  faHandFist,
  faHardDrive,
  faPlay,
  faRocket,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function GameDetailLibrary() {
  return (
    <main className="flex flex-col items-center gap-5">
      <div className="bg-white w-full h-96 relative">
        <img
          src="https://cdn2.steamgriddb.com/hero/0a30a29822b9ea4efaa92d60a93c78cb.jpg"
          className="object-cover w-full h-[30rem]"
          alt=""
        />
        <div className="bg-gradient-to-t from-background_primary via-background_primary/50 w-full h-[7rem] absolute bottom-0 translate-y-[6.2rem]"></div>
      </div>

      {/* column */}
      <div className="container flex gap-8 px-6 z-10">
        {/* left column ========================================== */}
        <div className="flex flex-col gap-8 w-2/3">
          {/* Header  */}
          <section className="flex flex-col gap-4">
            <p className="text-3xl font-medium">Call of Duty : Black Ops 6</p>
            <div className="flex gap-4">
              <p className="flex gap-2 items-center">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-text_disabled"
                />
                <label className="text-text_disabled">Play Time : </label> 2038
                hours
              </p>
              <div className="border border-background_disabled"></div>
              <p className="flex gap-2 items-center">
                <FontAwesomeIcon
                  icon={faRocket}
                  className="text-text_disabled"
                />
                <label className="text-text_disabled">Last Launched : </label>{" "}
                Nov 29, 2024
              </p>
            </div>
          </section>

          {/* Description  */}
          <section className="flex flex-col gap-4 bg-background_secondary px-6 py-4 rounded-xl">
            <p className="text-xl font-medium">Description</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Consequuntur accusantium deleniti dolor dolores, minus hic
              doloremque ut cum mollitia alias modi sequi blanditiis totam.
              Deserunt, necessitatibus et. Tempore, libero sint. Lorem ipsum
              dolor sit amet, consectetur adipisicing elit. Ab veniam corrupti
              reprehenderit temporibus doloremque distinctio, numquam vitae quod
              animi eos.
            </p>
          </section>
        </div>
        {/* right column ========================================== */}
        <div className="w-1/3 min-w-[300px] flex flex-col gap-8">
          {/* price  */}
          <section className="bg-background_primary shadow-arise-sm w-full p-6 rounded-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p>current price</p>
              <p className="text-3xl font-bold">$271,15</p>
            </div>
            {/* button  */}
            <div className="flex flex-col gap-4">
              <button className="bg-grad px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center">
                <FontAwesomeIcon icon={faPlay} />
                Launch
              </button>
              <button className="border border-white/20 px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center">
                <FontAwesomeIcon icon={faStore} />
                Items
              </button>
            </div>
            {/* Details  */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-background_primary w-7 h-7 flex justify-center items-center rounded-full ">
                  <FontAwesomeIcon
                    icon={faCode}
                    className="text-accent_primary size-3"
                  />
                </div>
                <p>Created by Antigane Studio</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-background_primary w-7 h-7 flex justify-center items-center rounded-full ">
                  <FontAwesomeIcon
                    icon={faHardDrive}
                    className="text-accent_primary size-3"
                  />
                </div>
                <p>Storage 256GB</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-background_primary w-7 h-7 flex justify-center items-center rounded-full ">
                  <FontAwesomeIcon
                    icon={faHandFist}
                    className="text-accent_primary size-3"
                  />
                </div>
                <p>for Everyone</p>
              </div>
            </div>
          </section>

          {/* friend list  */}
          <section className="flex flex-col gap-4">
            <p className="text-xl font-medium">Friends who use</p>
            <div className="flex flex-wrap gap-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJalEtY1wqHyc-P1vMV86iSQI6HJTuXyCWYQ&s"
                className="w-10 h-10 rounded-lg object-cover"
                alt=""
              />
            </div>
          </section>
          <div className="my-32"></div>
        </div>
      </div>
    </main>
  );
}

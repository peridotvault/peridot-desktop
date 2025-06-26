// @ts-ignore
import React, { useEffect, useState } from "react";
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
  const [list_announcement] = useState([
    {
      date: "Dec 24, 2024",
      announcements: [
        {
          img_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuELWiuZ7LLpj9Kr3sQ-8Shvsk0UrqmGhiGg&s",
          type: "In-Game Event",
          title: "World Tour | ISEUL-T Cup | Strike A Pose!",
          description:
            "As ISEUL-T’s generous sponsorship comes to an end they want to see your flashiest moves! This week, your team will be rewarded with some extra cash for showing off by emoting near a cashout that your team starts, steals, or completes! A dance floor appears whenever a player opens a vault, starts a cashout, steals a cashout or completes a cashout. When the dance floor appears you have 5 seconds to strike a pose, and hold that pose for at least 2 seconds - doing so awards your team with $1000. Everyone in your team can do it - so make sure to coordinate your best moves and maximize that cash!",
        },
        {
          img_url: "https://pbs.twimg.com/media/GYZxIMcaMAMIzvR.jpg:large",
          type: "Regular Update",
          title: "Update 5.6.0",
          description:
            "The power levels are at an all-time high in The Arena this week as DISSUN unveils its newest advertisement in preparation for its takeover of the World Tour starting tomorrow. The fuel company has a lot in store for you, so get ready to celebrate Lunar New Year in a powerful way, as a brand-new throwable takes center stage in the festively decorated Arena!",
        },
      ],
    },
    {
      date: "Dec 23, 2024",
      announcements: [
        {
          img_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuELWiuZ7LLpj9Kr3sQ-8Shvsk0UrqmGhiGg&s",
          type: "In-Game Event",
          title: "World Tour | ISEUL-T Cup | Strike A Pose!",
          description:
            "As ISEUL-T’s generous sponsorship comes to an end they want to see your flashiest moves! This week, your team will be rewarded with some extra cash for showing off by emoting near a cashout that your team starts, steals, or completes! A dance floor appears whenever a player opens a vault, starts a cashout, steals a cashout or completes a cashout. When the dance floor appears you have 5 seconds to strike a pose, and hold that pose for at least 2 seconds - doing so awards your team with $1000. Everyone in your team can do it - so make sure to coordinate your best moves and maximize that cash!",
        },
        {
          img_url: "https://pbs.twimg.com/media/GYZxIMcaMAMIzvR.jpg:large",
          type: "Regular Update",
          title: "Update 5.6.0",
          description:
            "The power levels are at an all-time high in The Arena this week as DISSUN unveils its newest advertisement in preparation for its takeover of the World Tour starting tomorrow. The fuel company has a lot in store for you, so get ready to celebrate Lunar New Year in a powerful way, as a brand-new throwable takes center stage in the festively decorated Arena!",
        },
      ],
    },
  ]);

  const AnnouncementContainer = ({
    img_url,
    type,
    title,
    description,
  }: {
    img_url: string;
    type: string;
    title: string;
    description: string;
  }) => {
    return (
      <section className="p-6 shadow-arise-sm hover:shadow-sunken-sm rounded-2xl flex gap-6">
        <img
          src={img_url}
          alt=""
          className="w-[300px] aspect-video shadow-sunken-sm object-cover rounded-xl"
        />
        <div className="gap-2 flex flex-col">
          <p className="text-text_disabled uppercase line-clamp-1">{type}</p>
          <p className="line-clamp-2 text-xl">{title}</p>
          <p className="line-clamp-4 text-text_disabled">{description}</p>
        </div>
      </section>
    );
  };

  return (
    <main className="flex flex-col items-center gap-5 mb-32">
      <div className="bg-white w-full h-96 relative">
        <img
          src="https://cdn2.steamgriddb.com/hero/0a30a29822b9ea4efaa92d60a93c78cb.jpg"
          className="object-cover w-full h-[30rem]"
          alt=""
        />
        <div className="bg-gradient-to-t from-background_primary via-background_primary/50 w-full h-[7rem] absolute bottom-0 translate-y-[6.2rem]"></div>
      </div>

      {/* column */}
      <div className="container flex gap-8 px-6 z-10 ">
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

          {/* Announcements  */}
          {list_announcement.map((item, index) => (
            <div key={index} className="flex flex-col gap-5">
              <div className="flex items-center">
                <p className="text-xl w-[150px]">{item.date}</p>
                <hr className="border-background_disabled w-full" />
              </div>
              {item.announcements.map((item, index) => (
                <AnnouncementContainer
                  key={index}
                  img_url={item.img_url}
                  description={item.description}
                  title={item.title}
                  type={item.type}
                />
              ))}
            </div>
          ))}
        </div>
        {/* right column ========================================== */}
        <div className="w-1/3 min-w-[300px] flex flex-col gap-8">
          {/* price  */}
          <section className="bg-background_primary shadow-flat-sm w-full p-6 rounded-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p>current price</p>
              <p className="text-3xl font-bold">$271,15</p>
            </div>
            {/* button  */}
            <div className="flex flex-col gap-4">
              <button className="bg-success px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center">
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

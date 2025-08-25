// @ts-ignore
import React from "react";
import { AnnouncementInterface } from "../../interfaces/announcement/AnnouncementInterface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbTack } from "@fortawesome/free-solid-svg-icons";

export const AnnouncementContainer = ({
  item,
}: {
  item: AnnouncementInterface;
}) => {
  return (
    <section className="p-6 shadow-arise-sm hover:shadow-sunken-sm rounded-2xl flex gap-6">
      <img
        src={item.coverImage}
        alt=""
        className="w-[300px] aspect-video shadow-sunken-sm object-cover rounded-xl"
      />

      <div className="gap-2 flex flex-col">
        <p className="text-text_disabled text-base">
          {item.createdAt
            ? new Date(Number(item.createdAt) / 1_000_000).toLocaleDateString()
            : ""}
        </p>
        <div className="flex items-center gap-2">
          {item.pinned ? (
            <FontAwesomeIcon icon={faThumbTack} className="text-sm" />
          ) : (
            ""
          )}
          <h3 className="line-clamp-2 text-xl ">{item.headline}</h3>
        </div>
        <p className="line-clamp-4 text-text_disabled">{item.content}</p>
      </div>
    </section>
  );
};

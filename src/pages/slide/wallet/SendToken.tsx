import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { InputField } from "../../../components/InputField";
import { shortenAddress } from "../../../components/AdditionalComponent";

interface Props {
  onClose: () => void;
}

export const SendToken: React.FC<Props> = ({ onClose }) => {
  const friendLists = [
    {
      icon: "🦾",
      username: "ifal",
      address:
        "rvvbq-hdxby-qp72d-rkwmw-vfmiv-yf3e7-y3x2c-womvx-sylp2-23jfe-qae",
    },
    {
      icon: "🤖",
      username: "ssabrut",
      address:
        "rvvbq-hdxby-qp72d-rkwmw-vfmiv-yf3e7-y3x2c-womvx-sylp2-23jfe-qae",
    },
  ];

  return (
    <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex flex-col gap-6">
      {/* header  */}
      <section className="flex justify-between items-center">
        <button
          onClick={onClose}
          className=" w-10 h-10 flex justify-center items-center rounded-xl"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
        </button>
        <p className="text-lg font-semibold">Send</p>
        <div className="w-10 h-10"></div>
      </section>

      {/* To  */}
      <section className="flex items-center">
        <p className="w-12 text-lg">To :</p>
        <InputField
          onChange={(e) => {}}
          placeholder="Address, Principal or Contact"
          type="text"
          text={""}
        />
      </section>

      {/* content  */}
      <section className="flex flex-col gap-4">
        <p className="text-lg">My Contacts</p>
        {friendLists.map((item, index) => (
          <button
            key={index}
            onClick={() => {}}
            className="flex gap-4 items-center justify-between hover:scale-105 duration-300"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                <p className="size-5">{item.icon}</p>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-md font-semibold">{"@" + item.username}</p>
                <p>{shortenAddress(item.address, 20, 4)}</p>
              </div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};

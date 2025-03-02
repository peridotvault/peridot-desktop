import React, { useState } from "react";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputField } from "../../../components/InputField";

interface Props {
  onClose: () => void;
}

export const Manage: React.FC<Props> = ({ onClose }) => {
  const [searchToken, setSearchToken] = useState("");
  const [listGame, setListGame] = useState([
    {
      principal: "",
      logo: "",
      name: "Internet Protocol",
      symbol: "ICP",
      isChecked: false,
    },
    {
      principal: "",
      logo: "",
      name: "IFAL",
      symbol: "FAL",
      isChecked: false,
    },
  ]);
  const filteredGames = listGame.filter((token) =>
    token.name.toLowerCase().includes(searchToken.toLowerCase())
  );

  const handleToggle = (index: number) => {
    const updatedList = [...listGame];
    updatedList[index].isChecked = !updatedList[index].isChecked;
    setListGame(updatedList);
  };

  return (
    <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex flex-col gap-4">
      <div className="">
        <button
          onClick={onClose}
          className=" w-10 h-10 flex justify-center items-center rounded-xl"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
        </button>
      </div>

      <InputField
        onChange={(e) => setSearchToken(e)}
        placeholder="Enter Token Name"
        type="text"
        text={searchToken}
      />

      {/* Token Lists  */}
      <section className="flex flex-col gap-5 pt-2">
        {filteredGames.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
                {item?.logo != null ? (
                  <img
                    src={item?.logo != null ? item?.logo : "null"}
                    alt=""
                    className="w-full"
                  />
                ) : (
                  <div className="w-full h-full bg-background_disabled animate-pulse"></div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex gap-1 items-center">
                  {item?.symbol != null ? (
                    <p>{item?.symbol}</p>
                  ) : (
                    <div className="w-7 h-5 bg-background_disabled rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-xs">
                  {item?.name != null ? (
                    <p>{item?.name}</p>
                  ) : (
                    <div className="w-7 h-3 bg-background_disabled rounded-full animate-pulse mt-1"></div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label className="relative inline-block w-[3.4em] h-[1.5em]">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={item.isChecked}
                  onChange={() => handleToggle(index)}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-background_primary shadow-arise-sm transition-all duration-500 rounded-lg ${
                    item.isChecked ? "bg-white shadow-lg" : ""
                  }`}
                ></span>
                <span
                  className={`absolute content-[''] h-[.9em] w-[0.1em] rounded-none left-[0.5em] bottom-[0.3em] bg-white transition-transform duration-500 ${
                    item.isChecked
                      ? " bg-black translate-x-[2.4em] rotate-180"
                      : ""
                  }`}
                ></span>
              </label>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

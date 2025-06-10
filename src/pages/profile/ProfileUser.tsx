// @ts-ignore
import React, { useEffect, useState } from "react";
import { faGear, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  getFriendRequestList,
  getUserByPrincipalId,
  searchUsersByPrefixWithLimit,
} from "../../contexts/UserContext";
import { useWallet } from "../../contexts/WalletContext";
import { LoadingScreen } from "../../components/organisms/LoadingScreen";
import { InputField } from "../../components/atoms/InputField";
import { LoadingLogo } from "../../components/organisms/LoadingLogo";
import { getCoverImage, getProfileImage } from "../../utils/Additional";
import { MetadataUser } from "../../interfaces/User";

export const ProfileUser = () => {
  const { wallet } = useWallet();
  const [userData, setUserData] = useState<MetadataUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenAddFriend, setIsOpenAddFriend] = useState(false);
  const [list_announcement] = useState([
    {
      img_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuELWiuZ7LLpj9Kr3sQ-8Shvsk0UrqmGhiGg&s",
      type: "Game",
      title: "Assassin Creed",
      playtime: 7.5,
      last_played: "9 Feb 2024",
    },
    {
      img_url: "https://pbs.twimg.com/media/GYZxIMcaMAMIzvR.jpg:large",
      type: "App",
      title: "OBX Studio",
      playtime: 9.5,
      last_played: "9 Feb 2024",
    },
  ]);

  useEffect(() => {
    async function checkUser() {
      if (wallet.encryptedPrivateKey) {
        const isUserExist = await getUserByPrincipalId(
          wallet.encryptedPrivateKey
        );
        if (
          isUserExist &&
          typeof isUserExist === "object" &&
          "ok" in isUserExist
        ) {
          setUserData(isUserExist as MetadataUser);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    }

    let isMounted = true;
    const runCheck = async () => {
      while (isMounted) {
        checkUser();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    runCheck();

    return () => {
      isMounted = false;
    };
  });

  const AnnouncementContainer = ({
    img_url,
    type,
    title,
    playtime,
    last_played,
  }: {
    img_url: string;
    type: string;
    title: string;
    playtime: number;
    last_played: string;
  }) => {
    return (
      <section className="py-3 rounded-2xl flex gap-6">
        <img
          src={img_url}
          alt=""
          className="w-[200px] aspect-video shadow-sunken-sm object-cover rounded-xl"
        />
        <div className="gap-2 flex flex-col w-full">
          <p className="text-text_disabled uppercase line-clamp-1">{type}</p>
          <p className="line-clamp-2 text-xl">{title}</p>
          <div className="text-end">
            <p className="line-clamp-4 text-text_disabled">
              {playtime} hrs on record
            </p>
            <p className="line-clamp-4 text-text_disabled">
              last played on {last_played}
            </p>
          </div>
        </div>
      </section>
    );
  };

  const FriendComponent = ({}: {}) => {
    const [isFoundFriend, setIsFoundFriend] = useState<boolean | null>(null);
    const [username, setUsername] = useState("");
    const FriendList = ({}: {}) => {
      return (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuELWiuZ7LLpj9Kr3sQ-8Shvsk0UrqmGhiGg&s"
              alt=""
              className="w-11 h-11 object-cover rounded-full"
            />
            <p className="font-semibold">Ranaufal Muha</p>
          </div>
          <button className="border border-accent_primary rounded-md py-2 px-4 text-sm">
            Add Friend
          </button>
        </div>
      );
    };

    useEffect(() => {
      async function checkFriendRequestList() {
        const friendReq = await getFriendRequestList(wallet);
        if (friendReq && typeof friendReq === "object" && "ok" in friendReq) {
          setIsFoundFriend(true);
        } else {
          setIsFoundFriend(false);
        }
        console.log(friendReq);
      }

      checkFriendRequestList();
    }, []);

    async function searchUsers(e: string) {
      const res = await searchUsersByPrefixWithLimit(wallet, e, 5);
      console.log(res);
    }

    function handleOnChange(e: string) {
      setUsername(e);
      searchUsers(e);
    }

    return (
      <div
        className="bg-black/50 fixed w-full h-full top-0 left-0 z-30 flex justify-center items-center backdrop-blur-sm"
        onClick={() => setIsOpenAddFriend(false)}
      >
        <div
          className="overflow-hidden rounded-xl w-[450px] flex flex-col bg-background_primary pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-background_primary p-8 flex flex-col gap-3 shadow-flat-sm">
            <p className="text-xl font-bold">Invite Friend</p>
            <InputField
              onChange={(e) => handleOnChange(e)}
              placeholder="Search Username or Principal Id"
              value={username}
              type="text"
              name="Friends"
            />
          </div>
          <div className="pt-8">
            {isFoundFriend === null ? (
              <LoadingLogo />
            ) : isFoundFriend ? (
              <div className="flex flex-col gap-4 px-8 max-h-[200px] overflow-y-auto">
                <FriendList />
                <FriendList />
                <FriendList />
                <FriendList />
                <FriendList />
                <FriendList />
                <FriendList />
              </div>
            ) : (
              <p className="text-center text-text_disabled">no result</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="pt-20 flex flex-col items-center mb-10 px-10">
      {isLoading ? <LoadingScreen /> : ""}
      <div className="container flex gap-6 mt-6 duration-300">
        {/* left   ============================ */}
        <div className="w-full flex flex-col gap-6 duration-300 transition-all">
          {/* detail user  */}
          <section className="p-6 bg-background_primary rounded-3xl shadow-arise-sm">
            {/* cover  */}
            <div className="w-full h-[11rem]">
              <img
                src={getCoverImage(userData?.ok.background_image_url)}
                className="w-full h-[15rem] object-cover rounded-2xl "
                alt=""
              />
            </div>
            {/* profile  */}
            <div className="px-10 relative flex items-end gap-6 justify-between">
              {/* Img  */}
              <div className="w-36 h-36 bg-background_primary shadow-2xl rounded-full z-10 overflow-hidden p-2">
                <img
                  src={getProfileImage(userData?.ok.image_url)}
                  className="w-full h-full object-cover rounded-full"
                  alt=""
                />
              </div>
              {/* Setting  */}
              <button
                className="shadow-flat-sm hover:shadow-arise-sm w-12 h-12 rounded-lg"
                onClick={() => {}}
              >
                <div className="w-12 h-12 flex justify-center items-center">
                  <FontAwesomeIcon icon={faGear} />
                </div>
              </button>
            </div>
            {/* bio  */}
            <div className="flex flex-col gap-3 mt-3 px-10">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <p className="font-medium text-2xl">
                    {userData?.ok.display_name}
                  </p>
                  {userData?.ok.developer.length != 0 ? (
                    <div className="">
                      <span className="px-2 py-1 rounded-full border-accent_primary/50 border text-xs text-accent_primary">
                        dev
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                <p className="text-text_disabled text-lg">
                  @{userData?.ok.username}
                </p>
              </div>
            </div>
          </section>
          <section className="pt-6 p-16">
            <div className="flex flex-col gap-5">
              <div className="flex items-center">
                <p className="text-xl w-[170px]">Recent Activity</p>
                <hr className="border-background_disabled w-full" />
              </div>
              {list_announcement.map((item, index) => (
                <AnnouncementContainer
                  key={index}
                  img_url={item.img_url}
                  playtime={item.playtime}
                  title={item.title}
                  type={item.type}
                  last_played={item.last_played}
                />
              ))}
            </div>
          </section>
        </div>
        {/* right  ============================ */}
        <div className="w-2/5 max-w-[350px] flex flex-col gap-6 duration-300 transition-all">
          {/* Character Section  */}
          <section className="aspect-[3/4] rounded-3xl overflow-hidden shadow-flat-sm">
            <img
              src="https://i.pinimg.com/736x/e0/c1/11/e0c1114baf11244075041ea00cfca531.jpg"
              className="w-full h-full object-cover"
              alt=""
            />
          </section>
          {/* Friend Section  */}
          <section className="p-10 shadow-arise-sm rounded-3xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-medium">Friends {"(" + 32 + ")"}</p>
              <button
                className="shadow-flat-sm rounded-lg w-10 h-10 flex justify-center items-center hover:shadow-arise-sm"
                onClick={() => setIsOpenAddFriend(true)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {isOpenAddFriend ? <FriendComponent /> : ""}
            {/* lists friend  */}
            <div className="flex gap-3 items-center">
              <img
                src={getProfileImage(userData?.ok.image_url)}
                className="w-1/6 aspect-square object-cover rounded-lg shadow-arise-sm"
                alt=""
              />
              <div className="w-5/6">
                <p className="">@ranaufalm</p>
                <p className="text-accent_primary">Online</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <img
                src={getProfileImage(
                  "https://nnc-media.netralnews.com/2025/01/IMG-Netral-News-User-3610-NUWXYEMBS8.jpg"
                )}
                className="w-1/6 aspect-square object-cover rounded-lg shadow-arise-sm"
                alt=""
              />
              <div className="w-5/6">
                <p className="">@michael</p>
                <p className="text-accent_primary">Online</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <img
                src={getProfileImage(
                  "https://plus.unsplash.com/premium_photo-1664297541695-2620d79f4770?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                )}
                className="w-1/6 aspect-square object-cover rounded-lg shadow-arise-sm"
                alt=""
              />
              <div className="w-5/6">
                <p className="">@wintr</p>
                <p className="text-text_disabled">Last Online 240 days ago</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <img
                src="https://avatars.githubusercontent.com/u/195233134?s=200&v=4"
                className="w-1/6 aspect-square object-cover rounded-lg shadow-arise-sm"
                alt=""
              />
              <div className="w-5/6">
                <p className="">@peridot</p>
                <p className="text-text_disabled">Last Online 300 days ago</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

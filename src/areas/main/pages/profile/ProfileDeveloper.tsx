// @ts-ignore
import React, { useEffect, useState } from 'react';
import {
  faBookmark,
  faComment,
  faGear,
  faHeart,
  faShare,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import { LoadingScreen } from '@components/organisms/LoadingScreen';
import { getUserData } from '@features/profile/services/user.service';
import { UserInterface } from '@interfaces/user/UserInterface';
import { GetOpt } from '@interfaces/CoreInterface';

export default function ProfileDeveloper() {
  const { wallet } = useWallet();
  const [userData, setUserData] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      if (wallet.encryptedPrivateKey) {
        const isUserExist = await getUserData({
          wallet: wallet,
        });
        if (isUserExist) {
          setUserData(isUserExist as UserInterface);
          setIsLoading(false);
        }
      }
    }
    checkUser();
  }, [wallet]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="pt-20 flex flex-col items-center mb-10 px-10">
      <div className="container flex gap-6 mt-6">
        {/* left   ============================ */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* detail user  */}
          <section className="p-6 bg-background_primary rounded-3xl shadow-arise-sm">
            {/* cover  */}
            <div className="w-full h-44">
              <img
                src={GetOpt(userData?.backgroundImageUrl!)}
                className="w-full h-60 object-cover rounded-2xl "
                alt=""
              />
            </div>
            {/* profile  */}
            <div className="px-10 relative flex items-end gap-6">
              <div className="w-36 h-36 bg-background_primary shadow-2xl rounded-full z-10 overflow-hidden p-2">
                <img
                  src={GetOpt(userData?.imageUrl!)}
                  className="w-full h-full object-cover rounded-full"
                  alt=""
                />
              </div>
              <div className="flex py-3 gap-6 items-center">
                <div className="flex flex-col items-center">
                  <p className="font-medium text-2xl">1,092</p>
                  <p className="text-text_disabled">Posts</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-medium text-2xl">285k</p>
                  <p className="text-text_disabled">Followers</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-medium text-2xl">540</p>
                  <p className="text-text_disabled">Following</p>
                </div>
              </div>
            </div>
            {/* bio  */}
            <div className="flex flex-col gap-3 mt-3 px-10">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-2xl">{userData?.displayName}</p>
                <p className="text-text_disabled text-lg">@{userData?.username}</p>
              </div>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit quas nobis, eos
                unde saepe voluptates at culpa aliquam eaque esse.
              </p>
            </div>
            {/* links  */}
            <div className="mt-3 px-10">
              <Link to={'peridot.icu'} className="flex gap-2 items-center ">
                <FontAwesomeIcon
                  icon={faUpRightFromSquare}
                  className="text-sm text-text_disabled"
                />
                <p className="font-bold">peridot.icu</p>
              </Link>
            </div>
            {/* Follow  */}
            <div className="my-6 px-10 flex justify-between gap-6">
              <button className="w-1/2 shadow-flat-sm hover:shadow-arise-sm rounded-lg text-accent_primary font-bold h-12">
                Follow
              </button>
              <button className="w-1/2 shadow-sunken-sm hover:shadow-arise-sm rounded-lg h-12">
                Message
              </button>
              <button className="shadow-sunken-sm hover:shadow-arise-sm w-12 h-12 rounded-lg">
                <div className="w-12 h-12 flex justify-center items-center">
                  <FontAwesomeIcon icon={faGear} className="shadow-sunken-sm " />
                </div>
              </button>
              {/* <AnimatePresence>
                {isOpenWallet ? <Slide onClose={() => setIOpenWallet(false)} /> : ''}
              </AnimatePresence> */}
            </div>
          </section>
          {/* Posts  */}
          <section className="p-10 bg-background_primary rounded-3xl shadow-arise-sm flex flex-col gap-10">
            {/* post1  */}
            <div className="flex gap-6 items-start">
              {/* profile image  */}
              <div className="w-1/12">
                <img
                  src={GetOpt(userData?.imageUrl!)}
                  className="w-full aspect-square object-cover rounded-full shadow-flat-sm"
                  alt=""
                />
              </div>
              {/* Content  */}
              <div className="w-full flex flex-col gap-1">
                {/* username */}
                <p className="font-medium text-lg">@blacksamurai</p>
                {/* text content */}
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis provident ab
                  error vitae sapiente. Totam excepturi aliquid repellendus officia consequatur.
                </p>
                {/* image content */}
                <div className="mt-3">
                  <img
                    src={GetOpt(userData?.imageUrl!)}
                    className="w-full h-full rounded-xl"
                    alt=""
                  />
                </div>
                {/* actions */}
                <div className="mt-3 flex ">
                  {/* like  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faHeart} />
                    <p>19k</p>
                  </div>
                  {/* comment  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faComment} />
                    <p>595k</p>
                  </div>
                  {/* comment  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faShare} />
                    <p>595k</p>
                  </div>
                  {/* comment  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faBookmark} />
                    <p>595k</p>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-background_disabled" />
            {/* post2  */}
            <div className="flex gap-6 items-start">
              {/* profile image  */}
              <div className="w-1/12">
                <img
                  src={GetOpt(userData?.imageUrl!)}
                  className="w-full aspect-square object-cover rounded-full shadow-flat-sm"
                  alt=""
                />
              </div>
              {/* Content  */}
              <div className="w-full flex flex-col gap-1">
                {/* username */}
                <p className="font-medium text-lg">@blacksamurai</p>
                {/* text content */}
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis provident ab
                  error vitae sapiente. Totam excepturi aliquid repellendus officia consequatur.
                </p>
                {/* image content */}
                <div className="mt-3">
                  <img
                    src={GetOpt(userData?.backgroundImageUrl!)}
                    className="w-full h-full rounded-xl"
                    alt=""
                  />
                </div>
                {/* actions */}
                <div className="mt-3 flex ">
                  {/* like  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faHeart} />
                    <p>19k</p>
                  </div>
                  {/* comment  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faComment} />
                    <p>595k</p>
                  </div>
                  {/* comment  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faShare} />
                    <p>595k</p>
                  </div>
                  {/* comment  */}
                  <div className="w-1/4 flex items-center gap-2 text-text_disabled">
                    <FontAwesomeIcon icon={faBookmark} />
                    <p>595k</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* right  ============================ */}
        <div className="w-1/3 flex flex-col gap-6">
          {/* Character Section  */}
          <section className="aspect-3/4 rounded-3xl overflow-hidden shadow-flat-sm">
            <img
              src="https://i.pinimg.com/736x/e0/c1/11/e0c1114baf11244075041ea00cfca531.jpg"
              className="w-full h-full object-cover"
              alt=""
            />
          </section>
          {/* Friend Section  */}
          <section className="p-10 shadow-arise-sm rounded-3xl flex flex-col gap-5">
            <p className="text-2xl font-medium">Friends (32)</p>
            {/* lists friend  */}
            <div className="flex gap-3 items-center">
              <img
                src={GetOpt(userData?.imageUrl!)}
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
                src="https://nnc-media.netralnews.com/2025/01/IMG-Netral-News-User-3610-NUWXYEMBS8.jpg"
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
                src="https://plus.unsplash.com/premium_photo-1664297541695-2620d79f4770?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
}

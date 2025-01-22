// @ts-ignore
import React, { useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [list_game] = useState([
    {
      title: "Assassin's Creed Mirage",
      cover:
        "https://upload.wikimedia.org/wikipedia/fr/7/77/Assassin%27s_Creed_Mirage_Logo.png",
      path: "/library/assassins-creed-mirage",
    },
    {
      title: "Cyberpunk 2077",
      cover:
        "https://mir-s3-cdn-cf.behance.net/project_modules/1400/81a4e680815973.5cec6bcf6aa1a.jpg",
      path: "/library/cyberpunk-2077",
    },
    {
      title: "Red Dead Redemption 2",
      cover:
        "https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA08519_00/12/i_3da1cf7c41dc7652f9b639e1680d96436773658668c7dc3930c441291095713b/i/icon0.png",
      path: "/library/red-dead-redemption-2",
    },
    {
      title: "The Witcher 3",
      cover:
        "https://www.pngkey.com/png/full/306-3069557_the-witcher-3-wild-hunt-logo-2-witcher.png",
      path: "/library/the-witcher-3",
    },
    {
      title: "God of War Ragnarök",
      cover:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/05/God-of-War-Ragnarok-logo-was-fan-made.png",
      path: "/library/god-of-war-ragnarok",
    },
    {
      title: "Elden Ring",
      cover: "https://images.booksense.com/images/762/344/9780789344762.jpg",
      path: "/library/elden-ring",
    },
    {
      title: "Horizon Forbidden West",
      cover: "https://gamefaqs.gamespot.com/a/box/6/4/3/970643_side.jpg",
      path: "/library/horizon-forbidden-west",
    },
    {
      title: "Final Fantasy XVI",
      cover:
        "https://image.api.playstation.com/vulcan/ap/rnd/202011/0912/IDLyC9YgrZvtLwbFGxr8RceT.png",
      path: "/library/final-fantasy-xvi",
    },
    {
      title: "Starfield",
      cover:
        "https://assetsio.gnwcdn.com/Starfield-Logo_hlE66xH.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp",
      path: "/library/starfield",
    },
    {
      title: "Resident Evil 4",
      cover:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5I_ZEK2FsdEefF9f7F9YKYJU8P1K9CaJYEg&s",
      path: "/library/resident-evil-4",
    },
    {
      title: "Baldur's Gate 3",
      cover: "https://m.media-amazon.com/images/I/81s28Eg93NL.jpg",
      path: "/library/baldurs-gate-3",
    },
    {
      title: "Spider-Man 2",
      cover:
        "https://i.pinimg.com/736x/91/0b/55/910b55b02ed9c0d676cd935f1cb8c344.jpg",
      path: "/library/spider-man-2",
    },
    {
      title: "Starfield",
      cover:
        "https://assetsio.gnwcdn.com/Starfield-Logo_hlE66xH.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp",
      path: "/library/starfield",
    },
    {
      title: "Resident Evil 4",
      cover:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5I_ZEK2FsdEefF9f7F9YKYJU8P1K9CaJYEg&s",
      path: "/library/resident-evil-4",
    },
    {
      title: "Baldur's Gate 3",
      cover: "https://m.media-amazon.com/images/I/81s28Eg93NL.jpg",
      path: "/library/baldurs-gate-3",
    },
    {
      title: "Spider-Man 2",
      cover:
        "https://i.pinimg.com/736x/91/0b/55/910b55b02ed9c0d676cd935f1cb8c344.jpg",
      path: "/library/spider-man-2",
    },
    {
      title: "Final Fantasy XVI",
      cover:
        "https://image.api.playstation.com/vulcan/ap/rnd/202011/0912/IDLyC9YgrZvtLwbFGxr8RceT.png",
      path: "/library/final-fantasy-xvi",
    },
    {
      title: "Starfield",
      cover:
        "https://assetsio.gnwcdn.com/Starfield-Logo_hlE66xH.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp",
      path: "/library/starfield",
    },
    {
      title: "Resident Evil 4",
      cover:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5I_ZEK2FsdEefF9f7F9YKYJU8P1K9CaJYEg&s",
      path: "/library/resident-evil-4",
    },
    {
      title: "Baldur's Gate 3",
      cover: "https://m.media-amazon.com/images/I/81s28Eg93NL.jpg",
      path: "/library/baldurs-gate-3",
    },
  ]);
  // Filtered games based on searchQuery
  const filteredGames = list_game.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGameClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full shadow-arise-sm w-[230px] z-10">
      <div className="mt-3"></div>
      {/* Search  */}
      <div className="px-5 py-2 mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-text_disabled"
            />
          </div>
          <input
            type="search"
            className="block w-full p-2 ps-10 text-sm border border-text_disabled rounded-lg bg-transparent outline-none"
            placeholder="Search The Game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {/* List Games  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1">
          {filteredGames.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                onClick={() => handleGameClick(item.path)}
                className={`flex gap-3 px-7 py-2 items-center  duration-100
              ${
                isActive ? "shadow-flat-sm scale-110" : "hover:shadow-arise-sm "
              }`}
                key={i}
              >
                <img
                  src={item.cover}
                  className="w-6 h-6 object-cover rounded-md"
                  alt=""
                />
                <p className="truncate text-sm">{item.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

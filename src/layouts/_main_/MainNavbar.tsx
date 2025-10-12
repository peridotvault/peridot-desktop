import React from 'react';
import { getProfileImage } from '../../utils/Additional';
import { SearchInput } from '../../components/organisms/search-input';
import { ButtonWithSound } from '../../components/atoms/button-with-sound';

interface NavbarProps {
  onOpenMainMenu: () => void;
  profileImage: string | undefined | null;
}

export const MainNavbar: React.FC<NavbarProps> = ({ onOpenMainMenu, profileImage }) => {
  const chains = [
    {
      name: 'Internet Computer',
      imgUrl: '/images/chains/icp.webp',
    },
    {
      name: 'Solana',
      imgUrl: '/images/chains/sol.webp',
    },
    {
      name: 'Ethereum',
      imgUrl: '/images/chains/eth.webp',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background shadow-flat-sm">
      <div className="flex w-full px-12 justify-center">
        <div className="flex justify-between items-center max-w-[1400px] gap-5 w-full">
          {/* left ========================================= */}
          <section className="flex gap-5 font-bold text-lg items-center w-80">
            <SearchInput />
          </section>

          {/* Right ========================================= */}
          <section className="flex gap-5 items-center">
            <div className="flex gap-3">
              {chains.map((item, index) => (
                <ButtonWithSound
                  key={index}
                  className="w-11 h-11 shadow-arise-sm rounded-md flex items-center justify-center"
                >
                  <img
                    src={item.imgUrl}
                    alt={item.name + ' Logo'}
                    width={24}
                    className="rounded-full bg-black"
                  />
                </ButtonWithSound>
              ))}
            </div>
            <button
              onClick={onOpenMainMenu}
              className="bg-background pt-6 pb-3 mb-3 px-3 rounded-b-full hover:shadow-arise-sm shadow-flat-sm duration-300"
              aria-label="Open profile"
            >
              <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                <img
                  src={getProfileImage(profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </section>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { getProfileImage } from '../../utils/Additional';
import { SearchInput } from '../../components/organisms/search-input';

interface NavbarProps {
  onOpenMainMenu: () => void;
  profileImage: string | undefined | null;
}

export const MainNavbar: React.FC<NavbarProps> = ({ onOpenMainMenu, profileImage }) => {
  // const handleBack = () => {
  //   window.electronAPI?.goBack?.();
  // };
  // const handleForward = () => {
  //   window.electronAPI?.goForward?.();
  // };

  return (
    // STICKY di dalam kolom konten
    <div className="sticky top-0 z-40 bg-background_primary shadow-flat-sm">
      <div className="flex w-full px-12 justify-center">
        <div className="flex justify-between items-center max-w-[1400px] gap-5 w-full">
          <div className="flex gap-5 font-bold text-lg items-center w-80">
            <SearchInput />
            {/* Buttons Back/Forward */}
            {/* <div className="flex items-center gap-3">
            <button
              className="h-7 aspect-square flex items-center justify-center text-2xl"
              onClick={handleBack}
              aria-label="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              className="h-7 aspect-square flex items-center justify-center text-2xl"
              onClick={handleForward}
              aria-label="Forward"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div> */}
          </div>

          <div className="flex gap-5 items-center">
            <button
              onClick={onOpenMainMenu}
              className="bg-background_primary pt-6 pb-3 mb-3 px-3 rounded-b-full hover:shadow-arise-sm shadow-flat-sm duration-300"
              aria-label="Open profile"
            >
              <div className="w-8 h-8 rounded-full bg-background_secondary overflow-hidden">
                <img
                  src={getProfileImage(profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

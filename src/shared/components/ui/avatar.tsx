// @ts-ignore
import React from 'react';
import { ImageAvatarNotFound } from '@shared/lib/constants/const-url';

export const Avatar = ({
  isOnline = true,
  imageUrl,
}: {
  isOnline?: boolean;
  imageUrl?: string;
}) => {
  const url = imageUrl ? imageUrl : ImageAvatarNotFound;
  switch (isOnline) {
    case true:
      return (
        <div className="relative inline-flex justify-center">
          <img
            src={url}
            alt="avatar"
            draggable={false}
            className="inline-block relative object-cover object-center rounded w-10 h-10 bg-muted-foreground"
          />
          <span className="absolute min-w-2.5 min-h-2.5 rounded-full py-1 px-1 text-xs leading-none grid place-items-center top-[14%] right-[14%] translate-x-3/4 -translate-y-3/4 bg-green-500 text-foreground border border-background"></span>
        </div>
      );

    case false:
      return (
        <div className="relative inline-flex justify-center">
          <img
            src={url}
            alt="avatar"
            draggable={false}
            className="inline-block relative object-cover object-center rounded-full w-10 h-10 bg-muted-foreground"
          />
          <span className="absolute min-w-2.5 min-h-2.5 rounded-full py-1 px-1 text-xs leading-none grid place-items-center bottom-[14%] right-[14%] translate-x-3/4 translate-y-3/4 bg-muted-foreground text-foreground border border-background"></span>
        </div>
      );

    default:
      break;
  }
};

// @ts-ignore
import React, { ChangeEvent } from 'react';

export const BannerFieldComponent = ({
  title,
  imageUrl,
  onChange,
}: {
  title: string;
  imageUrl: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="capitalize font-semibold">{title}</p>
      <div className="flex justify-center">
        <div className="shadow-arise-sm w-full flex justify-center items-center h-100 rounded-xl overflow-hidden bg-background_secondary">
          {imageUrl ? (
            <img
              src={imageUrl} // sekarang langsung pakai URL publik
              className="w-full h-full object-cover"
              alt="preview"
            />
          ) : (
            <span className="text-sm text-text_disabled">No image</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          required={!imageUrl}
          onChange={onChange}
          className="w-full bg-transparent shadow-sunken-sm px-5 mt-3 py-3 rounded-lg"
        />
      </div>

      {/* <input
        type="file"
        accept="image/*"
        required
        onChange={(e) => handleImageUpload(e)}
        className="w-full bg-transparent shadow-sunken-sm px-5 mt-3 py-3 rounded-lg"
      /> */}
    </div>
  );
};

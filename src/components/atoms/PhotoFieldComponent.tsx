import React, { ChangeEvent } from "react";
import { getProfileImage } from "../../utils/Additional";

export const PhotoFieldComponent = ({
  title,
  image_url,
  setImageUrl,
}: {
  title: string;
  image_url: string;
  setImageUrl: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size
      const MAX_FILE_SIZE = 1.5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(
          `File size exceeds 1.5MB limit. Current size: ${currentSizeMB}MB`
        );
        e.target.value = "";
        return;
      }

      // Convert to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert image to base64"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      setImageUrl(base64String);
    } catch (error) {
      console.error("Error handling image upload:", error);
      e.target.value = "";
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="capitalize font-semibold">{title}</p>
      <div className="flex justify-center">
        <div className="shadow-arise-sm w-[230px] aspect-[3/4] rounded-xl overflow-hidden">
          {image_url && (
            <img
              src={getProfileImage(image_url)}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e)}
        className="w-full bg-transparent shadow-sunken-sm px-5 mt-3 py-3 rounded-lg"
      />
    </div>
  );
};

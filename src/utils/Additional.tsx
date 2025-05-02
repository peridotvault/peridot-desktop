import { EncryptedData } from "@antigane/encryption";

export const shortenAddress = (
  address: string | null,
  firstSlice: number,
  secondSlice: number
) => {
  if (address)
    return `${address.slice(0, firstSlice)}...${address.slice(-secondSlice)}`;
};

export const getProfileImage = (url: string | undefined | null) => {
  return url == "" || url == null || url == undefined
    ? "./assets/img/profile_not_found.png"
    : url;
};

export const getCoverImage = (url: string | undefined | null) => {
  return url == "" || url == null || url == undefined
    ? "./assets/img/cover_not_found.png"
    : url;
};

export const copyToClipboard = (data: EncryptedData | string | null) => {
  if (!data) return;
  const textToCopy = typeof data === "string" ? data : data.data;
  navigator.clipboard.writeText(textToCopy).catch((err) => {
    console.error("Failed to copy: ", err);
  });
};

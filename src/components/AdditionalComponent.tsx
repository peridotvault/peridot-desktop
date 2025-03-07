export const shortenAddress = (
  address: string | null,
  firstSlice: number,
  secondSlice: number
) => {
  if (address)
    return `${address.slice(0, firstSlice)}...${address.slice(-secondSlice)}`;
};

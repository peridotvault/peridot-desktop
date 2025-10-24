export const shortenAddress = ({
  address,
  slice = 4,
}: {
  address: string | null;
  slice?: number;
}) => {
  if (address) return `${address.slice(0, slice)}...${address.slice(-slice)}`;
  return 'Connect Wallet'; // Tampilkan pesan jika tidak ada alamat
};

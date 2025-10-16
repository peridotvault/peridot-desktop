export const formatMDY = (iso: string | number | Date) => new Date(iso).toLocaleDateString('en-US');

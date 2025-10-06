export const ImageLoading = './assets/img/cover2_not_found.png';
export const hostICP =
  import.meta.env.VITE_NETWORK == 'local'
    ? import.meta.env.VITE_LOCAL_HOST
    : import.meta.env.VITE_HOST;

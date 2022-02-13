export const truncateString = (str, num) =>
  str?.length > num ? `${str.slice(0, num)}...` : str;

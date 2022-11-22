export const truncateString = (str: string, num: number) =>
  str?.length > num ? `${str.slice(0, num)}...` : str;

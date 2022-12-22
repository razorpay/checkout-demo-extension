import { methodNameMapping, MONTHS } from './constant';

export function getTimestamp() {
  const date = new Date();
  return `${
    MONTHS[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()} | ${`0${date.getHours()}`.slice(
    -2
  )}:${`0${date.getMinutes()}`.slice(-2)} ${
    date.getHours() >= 12 ? 'PM' : 'AM'
  }`;
}

export function getMethodName(key: keyof typeof methodNameMapping) {
  return methodNameMapping[key] || key;
}

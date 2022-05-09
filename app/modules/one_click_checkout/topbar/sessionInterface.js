import { getSession } from 'sessionmanager';

export function setAmount(amount) {
  const session = getSession();
  session.setAmount(amount);
}

export function setTopbarBack(topbar) {
  const session = getSession();
  topbar.$on('back', session.back.bind(session));
}

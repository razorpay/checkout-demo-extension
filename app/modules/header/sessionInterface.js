import { getSession } from 'sessionmanager';

export function handleModalClose() {
  const session = getSession();
  session.closeModal();
}

export function setHeaderBack(header) {
  const session = getSession();
  header.$on('back', session.back.bind(session));
}

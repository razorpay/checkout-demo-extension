import { getSession } from 'sessionmanager';

export const handleModalClose = () => {
  const session = getSession();

  session.closeModal();
};

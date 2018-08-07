let sessions = {};
export const getSession = (id = Track.id) => {
  /**
   * TODO: once all modules are moved to ES6 import track instead of using
   * global Track.
   */
  return sessions[id];
};

export const createSession = (options, id = Track.id) => {
  /* TODO: import session here, session is global for now */
  return (sessions[id] = new Session(options));
};

export const setSession = (session, id = Track.id) => {
  sessions[id] = session;
};

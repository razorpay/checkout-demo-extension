import Track from 'tracker';

/* global Session */

let sessions = {};
export const getSession = (id = Track.id) => {
  return sessions[id];
};

export const createSession = (options, id = Track.id) => {
  /* TODO: import session here, session is global for now */
  return (sessions[id] = new Session(options));
};

export const setSession = (session, id = Track.id) => {
  sessions[id] = session;
};

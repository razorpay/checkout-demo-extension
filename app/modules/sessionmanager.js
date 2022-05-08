import { Track } from 'analytics';

let Session;
let sessions = {};
export const getSession = (id = Track.id) => {
  return sessions[id];
};

export const setSessionConstructor = (_Session) => {
  Session = _Session;
};

export const createSession = (options, id = Track.id) => {
  /** not using session via import as it will cause Circular Dependencies */
  /* TODO: import session here, session is global for now */
  return (sessions[id] = new Session(options));
};

export const setSession = (session, id = Track.id) => {
  sessions[id] = session;
};

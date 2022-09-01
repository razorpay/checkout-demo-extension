export function sendToAll(payload) {
  if (!window?.ga) {
    return;
  }

  const ga = window.ga;
  const trackers = ga.getAll() || [];

  for (let i = 0; i < trackers.length; i++) {
    const tracker = trackers[i].get('name') + '.send';
    ga(tracker, payload);
  }
}

export function sendToAll(event, payload) {
  if (!window?.ga) {
    return;
  }

  const ga = window.ga;
  const trackers = ga.getAll() || [];

  for (let i = 0; i < trackers.length; i++) {
    const tracker = trackers[i].get('name') + `.${event}`;
    ga(tracker, payload);
  }
}

/* global templates, showOverlay, hideEmi, Event */
import Alert from 'ui/elements/Downtime/Alert.svelte';

export default function downtimeAlertView(session) {
  const wrap = _Doc.querySelector('#modal-inner');

  this.view = new Alert({
    target: wrap,
  });
}

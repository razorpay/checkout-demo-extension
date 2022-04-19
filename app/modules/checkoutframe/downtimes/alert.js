/* global showOverlay, hideEmi, Event */
import Alert from 'ui/elements/Downtime/Alert.svelte';
import { querySelector } from 'utils/doc';
export default function downtimeAlertView() {
  const wrap = querySelector('#modal-inner');

  this.view = new Alert({
    target: wrap,
  });
}

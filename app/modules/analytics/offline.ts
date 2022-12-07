const OFFLINE_CHALLAN_EVENTS = {
  SUBMIT_DATA: 'submit',
  COPY_CLICK: 'offline_challan:copy:click',
  PRINT_CLICK: 'offline_challan:print:click',
  PRINT_DOWNLOADED: 'offline_challan:print:downloaded',
} as const;

export default OFFLINE_CHALLAN_EVENTS;

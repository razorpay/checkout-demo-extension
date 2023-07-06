import { EVENT_TYPES, MENU } from "../constants";

let scrapedData = {};
let order_id = "";
let activeProduct = MENU[0].id;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.from === "content") {
    switch (message.type) {
      case EVENT_TYPES.SET_SCRAPED_DATA: {
        scrapedData = message.value;
        break;
      }
      case EVENT_TYPES.SET_ORDER_ID: {
        order_id = message.value;
        break;
      }
    }
  } else if (message.from === "popup") {
    switch (message.type) {
      case EVENT_TYPES.GET_SCRAPED_DATA: {
        sendResponse(scrapedData);
        break;
      }
      case EVENT_TYPES.GET_ORDER_ID: {
        sendResponse(order_id);
        break;
      }

      case EVENT_TYPES.SET_ACTIVE_PRODUCT: {
        activeProduct = message.value;
        break;
      }

      case EVENT_TYPES.GET_ACTIVE_PRODUCT: {
        sendResponse(activeProduct);
        break;
      }
    }
  }
});

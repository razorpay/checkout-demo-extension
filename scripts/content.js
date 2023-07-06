import { DEFAULT_CX_OPTIONS, EVENT_TYPES } from "../constants";
import {
  createOrder,
  querySelectorFallback,
  scrapeAmountFromPage,
  scrapeCTAsFromPage,
  scrapeColourFromImage,
  scrapeLineItem,
  scrapeLogoFromPage,
  scrapeNameFromPage,
  showModal,
  showToast,
} from "./utils";

let options = DEFAULT_CX_OPTIONS;
let enableInspector = false;

/**
 * responsible for creating razorpay instance and opening checkout
 * @param {ClickEvent} ev
 */
function handleClick(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  delete options.selector;

  options.handler = (response) => {
    showModal({ state: "success", ...response });
  };

  if (!options.amount) {
    options.amount = 100;
  }
  const rzp = new Razorpay(options);

  // rzp.on("payment.failed", function (error) {
  //   showModal({ state: "fail", ...error });
  // });

  // rzp.on("payment.error", function (data) {
  //   showModal({ state: "fail", ...data });
  // });
  rzp.open();
}

/**
 * recieve data from popup script
 */
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.from === "popup") {
    switch (msg.type) {
      case EVENT_TYPES.SET_OPTIONS:
        if (msg.showToast) {
          showToast({ text: "Saved !" });
        }
        removeAndAddListener(options.selector, msg.options.selector);
        options = msg.options;
        break;

      case EVENT_TYPES.TOGGLE_INSPECTOR:
        handleInspector(msg);
        options = msg.options;
        break;

      default:
        break;
    }
  }
});

/**
 * removes click listener to first param and adds listener to second param
 * @param {string} selectorToRemove
 * @param {string} selectorToAdd
 */
function removeAndAddListener(selectorToRemove, selectorToAdd) {
  if (selectorToRemove && document.querySelector(selectorToRemove)) {
    document
      .querySelector(selectorToRemove)
      .removeEventListener("click", handleClick);
  }

  if (selectorToAdd && document.querySelector(selectorToAdd)) {
    document
      .querySelector(selectorToAdd)
      .addEventListener("click", handleClick);
  }
}

/**
 * Handles "pick from page" action from popup
 * @param {Object} msg
 */
function handleInspector(msg) {
  enableInspector = msg.enableInspector;
  /*
   to have a crosshair cursor for all elements
   disabled currently as it has issues
  */
  // const allElements = document.querySelectorAll("*");
  // if (enableInspector) {
  //   for (const ele of allElements) {
  //     ele.setAttribute(
  //       "style",
  //       "cursor: crosshair !important; pointer-events: none !important;"
  //     );
  //   }
  // } else {
  //   for (const ele of allElements) {
  //     ele.removeAttribute("style");
  //   }
  // }
}

/**
 * click listener for body
 * - used to get the selector value from clicked element (pick from page)
 * @param {ClickEvent} ev
 */
function handleDomClick(ev) {
  if (enableInspector) {
    ev.stopPropagation();
    ev.preventDefault();

    const btnSelector = querySelectorFallback(ev.target);

    showToast({ text: "Checkout linked !" });

    removeAndAddListener(options.selector, btnSelector);

    const url = document.location.href.split("?")[0];
    chrome.storage.local.get([url], (result) => {
      chrome.storage.local.set({
        [url]: {
          ...result[url],
          checkoutSelector: btnSelector,
        },
      });
    });
    enableInspector = false;
  }
}

async function sendScrapedData() {
  const data = {
    amount: +scrapeAmountFromPage() * 100 || 100,
    name: scrapeNameFromPage() || "",
  };

  data.image = await scrapeLogoFromPage();
  data["theme.color"] = await scrapeColourFromImage(data.image);

  options = {
    ...options,
    ...data,
  };

  createOrder(data, scrapeLineItem()).then((res) => {
    chrome.runtime.sendMessage({
      from: "content",
      type: EVENT_TYPES.SET_ORDER_ID,
      value: res.id,
    });
  });

  console.log("🚀 ~ sendScrapedData ~ data:", data);
  chrome.runtime.sendMessage({
    from: "content",
    type: EVENT_TYPES.SET_SCRAPED_DATA,
    value: data,
  });

  return Promise.resolve(data);
}

document.onreadystatechange = () => {
  // scrape and send amount after page load is completed
  if (document.readyState === "complete") {
    const ctas = scrapeCTAsFromPage();

    for (let i = 0; i < ctas.length; ++i) {
      ctas[i].element?.addEventListener("click", handleClick);
    }

    sendScrapedData().then((data) => {
      // in some specific cases, dom load event fires but the page is still not rendered
      // handling this by setting a timeout of 2s to scrape amount
      if (!data.amount) {
        setTimeout(() => {
          sendScrapedData();
        }, 2000);
      }
    });
  }
};
// fallback if complete event fires very late
setTimeout(() => {
  sendScrapedData();
}, 2000);

document.addEventListener(
  "click",
  (ev) => {
    handleDomClick(ev);
  },
  { capture: true }
);

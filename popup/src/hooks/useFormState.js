import { useEffect, useRef, useState } from "react";
import { createOptions, handleScrapeDataResponse, sendOptions } from "../utils";
import { COUNTRY_CONFIG, getCountry } from "../constants";
import { EVENT_TYPES } from "../../../constants";

export const useFormState = (withOrder) => {
  const [selector, setSelector] = useState("");
  const [options, setOptions] = useState(createOptions(getCountry()));
  const [country, setCountry] = useState(getCountry());
  const [mode, setMode] = useState("test");
  const optionsInStorage = useRef(false);
  const tabUrl = useRef("");

  const setDetailsFromPage = () => {
    chrome.runtime.sendMessage(
      {
        from: "popup",
        type: EVENT_TYPES.GET_SCRAPED_DATA,
      },
      (response) => {
        if (!optionsInStorage.current) {
          setOptions((options) => {
            const tempOptions = handleScrapeDataResponse(options, response);
            sendOptions(tempOptions, selector);
            return tempOptions;
          });
        }
      }
    );

    if (withOrder) {
      chrome.runtime.sendMessage(
        {
          from: "popup",
          type: EVENT_TYPES.GET_ORDER_ID,
        },
        (response) => {
          setOptions((options) => {
            const tempOptions = {
              ...options,
              order_id: {
                ...options.order_id,
                value: response,
              },
            };
            sendOptions(tempOptions, selector);
            return tempOptions;
          });
        }
      );
    }
  };

  const countryChangeHandler = (ev) => {
    let _country = ev.target.value;
    setCountry(_country);
    setOptions((options) => {
      return {
        ...createOptions(_country),
        key: {
          ...options.key,
          value:
            mode === "live"
              ? COUNTRY_CONFIG[_country].key.live
              : COUNTRY_CONFIG[_country].key.test,
        },
      };
    });
  };

  const resetHandler = () => {
    chrome.storage.local.remove([tabUrl.current]);
    setSelector("");
    setOptions(createOptions(country));
    setCountry(getCountry());
    setMode("test");
    setDetailsFromPage();
    optionsInStorage.current = false;
  };

  const submitHandler = () => {
    chrome.storage.local.set({
      [tabUrl.current]: {
        checkoutSelector: selector,
        checkoutOptions: JSON.stringify(options),
        country: country,
        mode: mode,
      },
    });

    sendOptions(options, selector, true).then(() => {
      window.close();
    });
  };

  const modeHandler = (ev) => {
    setMode(ev.target.value);
    setOptions((options) => {
      return {
        ...options,
        key: {
          ...options.key,
          value:
            ev.target.value === "live"
              ? COUNTRY_CONFIG[country].key.live
              : COUNTRY_CONFIG[country].key.test,
        },
      };
    });
  };

  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const url = tabs[0].url.split("?")[0];
        tabUrl.current = url;

        chrome.storage.local.get([url]).then((result) => {
          const dataStored = result[url];
          if (!dataStored) return;

          const tempOptions = dataStored.checkoutOptions
            ? JSON.parse(dataStored.checkoutOptions)
            : {};
          if (tempOptions && Object.keys(tempOptions).length) {
            optionsInStorage.current = true;
            setOptions(tempOptions);
          }

          setSelector(dataStored.checkoutSelector);

          if (dataStored.country) {
            setCountry(dataStored.country);
          }

          if (dataStored.mode) {
            setMode(dataStored.mode);
          }
        });
      }
    );

    setDetailsFromPage();
  }, []);

  return {
    options,
    setOptions,
    selector,
    setSelector,
    country,
    setCountry,
    countryChangeHandler,
    mode,
    modeHandler,
    tabUrl,
    resetHandler,
    submitHandler,
  };
};

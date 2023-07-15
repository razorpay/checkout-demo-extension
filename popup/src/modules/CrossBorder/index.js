import React, { useEffect, useState, useRef } from "react";
import { EVENT_TYPES } from "../../../../constants";
import {
  createOptions,
  handlePagePicker,
  handleScrapeDataResponse,
  sendOptions,
} from "../../utils";
import { COUNTRY_CONFIG, COUNTRY_TO_ISO, getCountry } from "../../constants";
import Accordian from "../../components/Accordian";
import styles from "./index.module.css";
import {
  CheckoutOptions,
  CountrySelect,
  FooterCta,
  Mode,
  Picker,
} from "../../components";

const CrossBorder = () => {
  const [selector, setSelector] = useState("");
  const [options, setOptions] = useState(createOptions(COUNTRY_TO_ISO.USA));
  const [country, setCountry] = useState(COUNTRY_TO_ISO.USA);
  const [mode, setMode] = useState("test");
  const optionsInStorage = useRef(false);
  const tabUrl = useRef("");

  const onInputChange = (value, key) => {
    setOptions((options) => ({
      ...options,
      [key]: {
        ...options[key],
        value,
      },
    }));
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

  const resetHandler = () => {
    chrome.storage.local.remove([tabUrl.current]);
    setSelector("");
    setOptions(createOptions(country));
    setCountry(getCountry());
    setMode("test");
    setDetailsFromPage();
    optionsInStorage.current = false;
  };

  const mxModeHandler = (ev) => {
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

  const setDetailsFromPage = () => {
    chrome.runtime.sendMessage(
      {
        from: "popup",
        type: EVENT_TYPES.GET_SCRAPED_DATA,
      },
      (response) => {
        if (!optionsInStorage.current) {
          const tempOptions = handleScrapeDataResponse(options, response);
          setOptions(tempOptions);
          sendOptions(tempOptions, selector);
        }
      }
    );
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

  return (
    <div className={styles.container}>
      <Picker
        onInputChange={(ev) => {
          setSelector(ev.target.value);
        }}
        onPagePick={() => handlePagePicker(options, selector)}
        selector={selector}
      />
      <div className={styles.selectContainer}>
        <div className={`${styles.column} ${styles.countrySelect}`}>
          <CountrySelect onChange={countryChangeHandler} country={country} />
        </div>
        <div className={styles.column}>
          <Mode mode={mode} onChange={mxModeHandler} />
        </div>
      </div>

      <Accordian
        containerStyle={styles.accordianContainer}
        title="Modify Checkout Options"
      >
        <div className={styles.optionsBox}>
          <CheckoutOptions options={options} onInputChange={onInputChange} />
        </div>
      </Accordian>

      <FooterCta onSubmit={submitHandler} onReset={resetHandler} />
    </div>
  );
};

export default CrossBorder;

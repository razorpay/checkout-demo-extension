import React, { useEffect, useState } from "react";
import StandardCheckout from "./modules/StandardCheckout";
import MagicCheckout from "./modules/MagicCheckout";
import ComingSoon from "./modules/ComingSoon";
import CrossBorder from "./modules/CrossBorder";
import Sidebar from "./components/Sidebar";
import ToggleSwitch from "./components/ToggleSwitch";
import rzplogo from "./assets/rzp-logo-text.svg";

import styles from "./app.module.css";
import { EVENT_TYPES, MENU } from "../../constants";
import { sendChromeMessage } from "./utils";
import Offers from "./modules/Offers";

const App = () => {
  const [activeMenu, setActiveMenu] = useState(MENU[0]);
  const [enableExtension, setEnableExtension] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["activeMenu"]).then((result) => {
      let menuIndex = MENU.findIndex((item) => item.id === result?.activeMenu);
      if (menuIndex !== -1) {
        setActiveMenu(MENU[menuIndex]);
      }
    });

    chrome.storage.local.get(["enableExtension"]).then((result) => {
      setEnableExtension(
        typeof result?.enableExtension === "boolean"
          ? result?.enableExtension
          : true
      );
    });
  }, []);

  const onMenuClick = (menu) => {
    setActiveMenu(menu);

    sendChromeMessage({
      type: EVENT_TYPES.SET_ACTIVE_PRODUCT,
      value: menu.id,
    });

    chrome.storage.local.set({
      ["activeMenu"]: menu.id,
    });
  };

  const renderScreen = () => {
    switch (activeMenu.id) {
      case "standard-cx":
        return <StandardCheckout />;
      case "magic-cx":
        return <MagicCheckout />;
      case "cross-border":
        return <CrossBorder />;
      case "offers":
        return <Offers />;
      default:
        return <ComingSoon />;
    }
  };

  const handleSwitchChange = (value) => {
    setEnableExtension(value);
    chrome.storage.local.set({
      ["enableExtension"]: value,
    });
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          from: "popup",
          type: EVENT_TYPES.TOGGLE_EXTENSION,
          value,
        });
      }
    );
  };

  return (
    <>
      <div
        className={`${styles.container} ${!enableExtension && styles.inactive}`}
      >
        {!enableExtension && <div className={styles.clickBlocker} />}
        <Sidebar onChange={onMenuClick} menu={MENU} activeMenu={activeMenu} />
        <div className={styles.screen}>
          <p className={styles.activeLabel}>{activeMenu.label}</p>
          {renderScreen()}
        </div>
      </div>
      <div className={styles.toggleBar}>
        <img className={styles.logo} src={rzplogo} />
        <ToggleSwitch
          enable={enableExtension}
          handleChange={handleSwitchChange}
        />
      </div>
    </>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import StandardCheckout from "./modules/StandardCheckout";
import MagicCheckout from "./modules/MagicCheckout";
import ComingSoon from "./modules/ComingSoon";
import CrossBorder from "./modules/CrossBorder";
import Sidebar from "./components/Sidebar";

import styles from "./app.module.css";
import { EVENT_TYPES, MENU } from "../../constants";

const App = () => {
  const [activeMenu, setActiveMenu] = useState(MENU[0]);

  useEffect(() => {
    chrome.runtime.sendMessage(
      {
        from: "popup",
        type: EVENT_TYPES.GET_ACTIVE_PRODUCT,
      },
      (response) => {
        let menuIndex = MENU.findIndex((item) => item.id === response);
        if (menuIndex !== -1) {
          setActiveMenu(MENU[menuIndex]);
        }
      }
    );
  }, []);

  const onMenuClick = (menu) => {
    setActiveMenu(menu);
    chrome.runtime.sendMessage({
      from: "popup",
      type: EVENT_TYPES.SET_ACTIVE_PRODUCT,
      value: menu.id,
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
      default:
        return <ComingSoon />;
    }
  };
  return (
    <div className={styles.container}>
      <Sidebar onChange={onMenuClick} menu={MENU} activeMenu={activeMenu} />
      <div className={styles.screen}>
        <p className={styles.activeLabel}>{activeMenu.label}</p>
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;

import React from "react";
import inspectIcon from "../../assets/ic-inspect.svg";
import styles from "./index.module.css";

const Picker = ({ onInputChange, onPagePick, selector }) => {
  return (
    <>
      <div className="header">
        <label className="header" htmlFor="selector">
          Add Selector for button
        </label>
        <button
          type="button"
          className={styles.pagePickerBtn}
          onClick={onPagePick}
        >
          Pick from page
          <img src={inspectIcon} className={styles.inspectIcon} />
        </button>
      </div>
      <input value={selector} onChange={onInputChange} />
    </>
  );
};

export default Picker;

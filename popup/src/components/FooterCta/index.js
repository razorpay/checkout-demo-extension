import React from "react";
import rzpLogo from "../../assets/rzp-logo.svg";
import resetIcon from "../../assets/ic-reset.svg";
import styles from "./index.module.css";

const FooterCta = ({ onSubmit, onReset }) => {
  return (
    <div className={styles.btnContainer}>
      <button className={styles.resetBtn} onClick={onReset}>
        <img src={resetIcon} />
        Reset
      </button>
      <button className={styles.submitBtn} onClick={onSubmit}>
        <img className={styles.rzpBtnLogo} src={rzpLogo} />
        Submit
      </button>
    </div>
  );
};

export default FooterCta;

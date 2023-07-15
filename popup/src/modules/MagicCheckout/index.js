import React from "react";
import { handlePagePicker } from "../../utils";
import Accordian from "../../components/Accordian";
import styles from "./index.module.css";
import {
  CheckoutOptions,
  CountrySelect,
  FooterCta,
  Mode,
  Picker,
} from "../../components";
import { useFormState } from "../../hooks/useFormState";

const MagicCheckout = () => {
  const {
    options,
    setOptions,
    selector,
    setSelector,
    country,
    countryChangeHandler,
    resetHandler,
    mode,
    modeHandler,
    submitHandler,
  } = useFormState(true);

  const onInputChange = (value, key) => {
    setOptions((options) => ({
      ...options,
      [key]: {
        ...options[key],
        value,
      },
    }));
  };

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
          <Mode mode={mode} onChange={modeHandler} />
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

export default MagicCheckout;

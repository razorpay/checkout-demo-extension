import React from "react";
import { handlePagePicker } from "../../utils";
import {
  Accordian,
  CountrySelect,
  CheckoutOptions,
  Picker,
  Mode,
  FooterCta,
} from "../../components";
import styles from "./index.module.css";
import { useFormState } from "../../hooks/useFormState";

const StandardCheckout = () => {
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
  } = useFormState();

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

export default StandardCheckout;

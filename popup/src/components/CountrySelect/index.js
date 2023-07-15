import React from "react";
import { COUNTRY_TO_ISO } from "../../constants";

const CountrySelect = ({ onChange, country }) => {
  return (
    <>
      <label className="header" htmlFor="country">
        Country
      </label>
      <select onChange={onChange} name="country" id="country" value={country}>
        {Object.entries(COUNTRY_TO_ISO).map(([key, value]) => (
          <option key={key} value={value}>
            {key}
          </option>
        ))}
      </select>
    </>
  );
};

export default CountrySelect;

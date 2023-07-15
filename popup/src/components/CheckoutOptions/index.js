import React from "react";
import Input from "../Input";
import Datalist from "../Datalist";

const CheckoutOptions = ({ options, onInputChange }) => {
  return Object.keys(options).map((key) => {
    let input = options[key];
    switch (input.type) {
      case "input":
        return (
          <Input
            {...input}
            key={input.id}
            onChange={(ev) => onInputChange(ev.target.value, key)}
          />
        );
      case "datalist":
        return (
          <Datalist
            {...input}
            key={input.id}
            onChange={(val) => onInputChange(val, key)}
          />
        );
    }
  });
};

export default CheckoutOptions;

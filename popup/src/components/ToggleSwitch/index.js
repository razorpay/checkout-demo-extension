import React, { useState } from "react";
import "./index.css";

const ToggleSwitch = ({ handleChange, enable }) => {
  function handleToggle() {
    handleChange(!enable);
  }
  return (
    <div className="switch-container">
      <span className="switch-text">{enable ? "Turn Off" : "Turn On"}</span>
      <input
        checked={enable}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        style={{ background: enable && "#fff" }}
        className="react-switch-label"
        htmlFor={`react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
    </div>
  );
};

export default ToggleSwitch;

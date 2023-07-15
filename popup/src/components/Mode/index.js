import React from "react";

const Mode = ({ onChange, mode }) => {
  return (
    <>
      <label className="header" htmlFor="merchant-mode">
        Mode
      </label>
      <select onChange={onChange} name="mode" id="merchant-mode" value={mode}>
        <option value="test">Test</option>
        <option value="live">Live</option>
      </select>
    </>
  );
};

export default Mode;

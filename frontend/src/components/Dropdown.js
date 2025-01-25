import React from "react";
import "../styles/Dropdown.css";

const Dropdown = ({ options, value, onChange, label }) => {
  return (
    <div className="dropdown">
      <label>{label}</label>
      <select value={value} onChange={onChange}>
        <option value="">-- Seleccionar --</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;

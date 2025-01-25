import React from "react";
import "../styles/Button.css";

const Button = ({ text, onClick, className = "default-button", style }) => {
  return (
    <button className={className} onClick={onClick} style={style}>
      {text}
    </button>
  );
};

export default Button;
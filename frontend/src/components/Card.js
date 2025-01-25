import React from "react";
import "../styles/Card.css";

const Card = ({ title, content, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};

export default Card;

// src/components/Button.jsx
import React from "react";

const Button = ({ type = "button", variant = "guardar", onClick, disabled = false, children, className = "" }) => {
  let classes = "";
  let buttonType = type; // Preservar el type recibido

  switch (variant) {
    case "guardar":
      classes = "align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 bg-gray-900 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none rounded-full";
      // Solo cambiar a submit si no se especificó un type
      if (type === "button" && variant === "guardar") {
        buttonType = "submit";
      }
      break;
    case "cancelar":
      classes = "px-6 py-3 font-sans text-xs font-bold text-center text-gray-900 uppercase align-middle transition-all rounded-full select-none disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none hover:bg-gray-900/10 active:bg-gray-900/20";
      buttonType = "button";
      break;
    case "editar":
      classes = "align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 border border-gray-900 text-gray-900 hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] rounded-full";
      break;
    default:
      classes = "align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 bg-gray-900 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none rounded-full";
  }

  return (
    <button type={buttonType} onClick={onClick} className={`${classes} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
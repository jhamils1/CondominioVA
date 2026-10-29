// src/components/StyledForm.jsx
import React from "react";

const StyledForm = ({ title = "Formulario", children, onSubmit }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-md shadow-md max-h-[90vh] flex flex-col">
      <h2 className="text-2xl font-semibold mb-6 flex-shrink-0">{title}</h2>
      <div className="flex-1 overflow-y-auto pr-2">
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      </div>
    </div>
  );
};

export default StyledForm;
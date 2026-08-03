import React from "react";

const TemplateCard = ({ template, onSelect }) => {
  return (
    <div className="template-card">

      <h2>{template.title}</h2>

      <p>{template.description}</p>

      <span>{template.category}</span>

      <button onClick={() => onSelect(template)}>
        Use Template
      </button>

    </div>
  );
};

export default TemplateCard;
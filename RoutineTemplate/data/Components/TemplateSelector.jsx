import React from "react";
import TemplateCard from "./TemplateCard";
import { routineTemplates } from "../data/routineTemplates";

const TemplateSelector = ({ loadTemplate }) => {
  return (
    <div className="template-grid">

      {routineTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={loadTemplate}
        />
      ))}

    </div>
  );
};

export default TemplateSelector;
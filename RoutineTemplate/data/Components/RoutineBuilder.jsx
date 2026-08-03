import React, { useState } from "react";
import TemplateSelector from "./TemplateSelector";

const RoutineBuilder = () => {

  const [routine, setRoutine] = useState([]);

  // Load Template
  const loadTemplate = (template) => {
    setRoutine(template.tasks);
  };

  return (
    <div>

      <h1>Routine Builder</h1>

      <TemplateSelector loadTemplate={loadTemplate} />

      <div className="routine-container">

        {routine.map((task, index) => (
          <div key={index} className="routine-task">

            <input
              type="text"
              value={task.time}
              onChange={(e) => {
                const updatedRoutine = [...routine];
                updatedRoutine[index].time = e.target.value;
                setRoutine(updatedRoutine);
              }}
            />

            <input
              type="text"
              value={task.activity}
              onChange={(e) => {
                const updatedRoutine = [...routine];
                updatedRoutine[index].activity =
                  e.target.value;
                setRoutine(updatedRoutine);
              }}
            />

          </div>
        ))}

      </div>

    </div>
  );
};

export default RoutineBuilder;
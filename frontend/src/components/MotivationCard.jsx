import React from "react";

const messages = {
  Tired: "Take small steps today. Progress matters more than perfection.",

  Normal: "You are doing great. Stay consistent and focused.",

  Motivated: "You are unstoppable today. Crush your biggest goals.",

  Overwhelmed:
    "Pause. Breathe. Focus on one small task at a time."
};

const MotivationCard = ({ mood }) => {
  return (
    <div className="mt-6 bg-zinc-900 text-white p-5 rounded-2xl shadow-lg">

      <h2 className="text-2xl font-bold mb-2">
        Productivity Assistant
      </h2>

      <p className="text-zinc-300">
        {messages[mood]}
      </p>

    </div>
  );
};

export default MotivationCard;
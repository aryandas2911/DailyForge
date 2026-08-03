import React from "react";

const moods = [
  {
    emoji: "😴",
    label: "Tired",
    color: "bg-blue-500"
  },

  {
    emoji: "😐",
    label: "Normal",
    color: "bg-gray-500"
  },

  {
    emoji: "🔥",
    label: "Motivated",
    color: "bg-orange-500"
  },

  {
    emoji: "😵",
    label: "Overwhelmed",
    color: "bg-red-500"
  }
];

const MoodSelector = ({ selectedMood, setSelectedMood }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      {moods.map((mood) => (
        <button
          key={mood.label}
          onClick={() => setSelectedMood(mood.label)}
          className={`
            p-5 rounded-2xl text-white font-semibold
            transition-all duration-300 hover:scale-105
            ${mood.color}
            ${
              selectedMood === mood.label
                ? "ring-4 ring-white"
                : ""
            }
          `}
        >

          <div className="text-4xl mb-2">
            {mood.emoji}
          </div>

          <p>{mood.label}</p>

        </button>
      ))}

    </div>
  );
};

export default MoodSelector;
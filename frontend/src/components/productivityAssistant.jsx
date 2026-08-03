import React, { useState } from "react";

import MoodSelector from "./MoodSelector";
import MotivationCard from "./MotivationCard";
import TaskSuggestions from "./TaskSuggestions";

import { tasks } from "../data/tasks";

const ProductivityAssistant = () => {

  const [selectedMood, setSelectedMood] =
    useState("Normal");

  return (
    <div className="min-h-screen bg-black p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-white mb-3">
          Mood-Based Productivity Assistant
        </h1>

        <p className="text-zinc-400 mb-8">
          Personalized productivity suggestions based on
          your current mental energy.
        </p>

        <MoodSelector
          selectedMood={selectedMood}
          setSelectedMood={setSelectedMood}
        />

        <MotivationCard mood={selectedMood} />

        <TaskSuggestions
          mood={selectedMood}
          tasks={tasks}
        />

      </div>

    </div>
  );
};

export default ProductivityAssistant;
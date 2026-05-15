import React from "react";

const DashboardHeader = ({ name }) => {
  return (
    <header className="animate-in flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 shadow-md rounded-xl bg-(--surface) gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-main leading-tight">
          Good afternoon, {name}
        </h1>
        <p className="text-sm text-muted mt-1">
          {new Date()
            .toLocaleDateString("en-US", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            })
            .replace(",", " ·")}
        </p>
      </div>
    </header>
  );
};

export default DashboardHeader;

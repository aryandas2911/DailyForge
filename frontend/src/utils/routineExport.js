import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Helper to resolve the task title from either populated object or task list
const getTaskTitle = (item, tasksList) => {
  if (item.taskId && typeof item.taskId === 'object' && item.taskId.title) {
    return item.taskId.title;
  }
  const task = tasksList?.find((t) => String(t._id) === String(item.taskId));
  return task?.title || "Unknown Task";
};

// Generates a readable plain-text summary of a routine
export const generateRoutineSummary = (routine, tasksList) => {
  const tasksByDay = routine.items.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    const title = getTaskTitle(item, tasksList);
    acc[item.day].push({
      ...item,
      title,
    });
    return acc;
  }, {});

  let summary = `Routine: ${routine.name}\n`;
  if (routine.description) {
    summary += `Description: ${routine.description}\n`;
  }
  summary += `\n`;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  days.forEach((day) => {
    if (tasksByDay[day] && tasksByDay[day].length > 0) {
      summary += `${day.toUpperCase()}:\n`;
      tasksByDay[day]
        .sort((a, b) => a.startTime - b.startTime)
        .forEach((task) => {
          const hours = String(Math.floor(task.startTime / 60)).padStart(2, "0");
          const minutes = String(task.startTime % 60).padStart(2, "0");
          summary += `- ${hours}:${minutes} (${task.duration} mins): ${task.title}\n`;
        });
      summary += `\n`;
    }
  });

  return summary.trim();
};

// Generates and downloads a print-friendly PDF of the routine
export const exportRoutineToPDF = async (routine, tasksList) => {
  // 1. Create a styled container for printing
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "800px";
  container.style.padding = "40px";
  container.style.background = "#ffffff";
  container.style.color = "#1e293b";
  container.style.fontFamily = "'Outfit', 'Inter', sans-serif";
  container.style.boxSizing = "border-box";

  // 2. Group items by day
  const tasksByDay = routine.items.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    const title = getTaskTitle(item, tasksList);
    acc[item.day].push({
      ...item,
      title,
    });
    return acc;
  }, {});

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let daysHTML = "";

  days.forEach((day) => {
    if (tasksByDay[day] && tasksByDay[day].length > 0) {
      const sortedTasks = tasksByDay[day].sort((a, b) => a.startTime - b.startTime);
      daysHTML += `
        <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; page-break-inside: avoid;">
          <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 20px; font-weight: 700; color: #3b8ea0; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">
            ${day}
          </div>
          <div style="padding: 8px 0;">
            ${sortedTasks
              .map((task, index) => {
                const hours = String(Math.floor(task.startTime / 60)).padStart(2, "0");
                const minutes = String(task.startTime % 60).padStart(2, "0");
                const isLast = index === sortedTasks.length - 1;
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; ${
                    !isLast ? "border-bottom: 1px solid #f1f5f9;" : ""
                  }">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #4eb7b3;"></div>
                      <span style="font-weight: 500; font-size: 15px; color: #1e293b;">${task.title}</span>
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #64748b; background-color: #f1f5f9; padding: 4px 10px; border-radius: 8px;">
                      ${hours}:${minutes} (${task.duration} mins)
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = `
    <div style="border-bottom: 3px solid #4eb7b3; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #3b8ea0; letter-spacing: -0.02em;">DailyForge</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #4eb7b3; font-weight: 500;">Your structured day, forged.</p>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; padding: 6px 12px; background-color: #d0f6e3; color: #3b8ea0; font-weight: 700; font-size: 11px; text-transform: uppercase; border-radius: 20px; border: 1px solid #98e1d7;">
          Routine Template
        </span>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #1e293b;">${routine.name}</h2>
      ${
        routine.description
          ? `<p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic; line-height: 1.5;">${routine.description}</p>`
          : ""
      }
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; background-color: #f8fafc; border-radius: 12px; padding: 16px;">
      <div>
        <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 4px;">Total Tasks</span>
        <strong style="font-size: 18px; color: #1e293b;">${routine.items.length} Tasks</strong>
      </div>
      <div>
        <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 4px;">Weekly Schedule</span>
        <strong style="font-size: 18px; color: #1e293b;">${
          new Set(routine.items.map((i) => i.day)).size
        } Active Day(s)</strong>
      </div>
    </div>

    <div>
      ${
        daysHTML ||
        '<p style="color: #64748b; font-style: italic; text-align: center; margin-top: 40px;">No tasks scheduled in this routine.</p>'
      }
    </div>

    <div style="margin-top: 50px; border-top: 1px dashed #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
      Generated via DailyForge. Manage your habits and schedules efficiently.
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale image to fit A4 width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // position offsets page scrolling
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${routine.name.replace(/\s+/g, "_")}_Routine.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
};

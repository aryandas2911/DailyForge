import { useEffect, useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import RoutineCard from "../components/Routine/RoutineCard.jsx";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import api from "../api/axios.js";
import EmptyState from "../components/EmptyState";
import { useScrollThenOpen } from "../hooks/useScrollThenOpen.js";
import { routineTemplates } from '../utils/routineTemplate';

export default function RoutineBuilder() {
  const { addTask, tasks } = useTasks();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState([]);
  const [description, setDescription] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [isImageExporting, setIsImageExporting] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateDay, setSelectedTemplateDay] = useState("Monday");
  const gridRef = useRef(null);
 

  const exportToImage = async () => {
    if (!gridRef.current) return;
    try {
      setIsImageExporting(true);
      const url = await toPng(gridRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "My_Weekly_Routine.png";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export routine as image.");
    } finally {
      setIsImageExporting(false);
    }
  };

  const normalizeDay = (day) => String(day || "").trim().toLowerCase();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleOpenModal = useScrollThenOpen(openModal, 0);

  const handleSubmit = async (data) => {
    try {
      await addTask({ ...data, status: "Due" });
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  useEffect(() => {
    if (!savedRoutines.length) return;

    const storedRoutineIds = JSON.parse(
      localStorage.getItem("activeRoutineIds") || "[]"
    );

    if (!storedRoutineIds.length) return;

    const restoredRoutines = savedRoutines.filter(
      (routine) => storedRoutineIds.includes(routine._id)
    );

    setActiveRoutine(restoredRoutines);
  }, [savedRoutines]);

  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);
      const res = await api.get("/routines");
      setSavedRoutines(
        Array.isArray(res.data.routines) ? res.data.routines : []
      );
    } catch (err) {
      console.error(err);
      setSavedRoutines([]);
    } finally {
      setLoadingRoutines(false);
    }
  };

  const confirmSaveRoutine = async () => {
    const items = scheduledTasks
      .filter((task) => task.day === selectedDay)
      .map((task) => ({
        taskId: task.taskId,
        title: task.title,
        day: selectedDay,
        startTime: task.startTime,
        duration: task.duration,
      }));

    try {
      const res = await api.post("/routines", {
        name: routineName,
        description,
        items,
      });

      const createdRoutine = res.data.routine || res.data.routines?.[0];
      if (createdRoutine) {
        setSavedRoutines((prevRoutines) => [
          createdRoutine,
          ...prevRoutines.filter((routine) => routine._id !== createdRoutine._id),
        ]);
      }

      setIsSaveModalOpen(false);
      setRoutineName("");
      setDescription("");
      setSelectedDay(null);
      alert("Routine saved successfully");
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to save routine";
      alert(errorMessage);
    }
  };

  const openSaveRoutineModal = (day) => {
    const hasTasks = scheduledTasks.some((t) => t.day === day);
    if (!hasTasks) {
      alert(`No tasks scheduled for ${day}`);
      return;
    }
    setSelectedDay(day);
    setRoutineName(`${day} Routine`);
    setIsSaveModalOpen(true);
  };

  const removeScheduledTask = (taskId, day) => {
    setScheduledTasks((prev) =>
      prev.filter(
        (task) =>
          !(
            task.taskId === taskId &&
            normalizeDay(task.day) === normalizeDay(day)
          )
      )
    );
  };
  const handleAdoptTemplate = (template) => {
    let currentHour = 9; 
    const hydratedTasks = template.tasks.map((task, index) => {
      const hour = currentHour + index;
      const formattedTime = `${hour < 10 ? '0' : ''}${hour}:00`;
      return {
        taskId: `temp_${crypto.randomUUID()}`, 
        title: task.title,
        day: selectedTemplateDay,
        startTime: formattedTime,
        duration: task.duration
      };
    });
    setScheduledTasks((prev) => [...prev, ...hydratedTasks]);
    setIsTemplateModalOpen(false);
  };
  

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const task = active.data.current?.task;
    if (!task) return;
    const { day, startTime } = over.data.current;

    setScheduledTasks((prev) => [
      ...prev.filter((t) => !(t.taskId === task._id && t.day === day)),
      { taskId: task._id, title: task.title, day, startTime, duration: 60 },
    ]);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => setActiveTask(event.active.data.current?.task)}
      onDragEnd={(event) => {
        setActiveTask(null);
        handleDragEnd(event);
      }}
    >
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-40 transition-colors duration-300 w-full box-border">
        
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in transition-colors">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-1 rounded-xl p-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Routine Builder
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Design your week</p>
            </div>
          </div>
          <button
            onClick={exportToImage}
            disabled={isImageExporting}
            className="px-4 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isImageExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>{isImageExporting ? "Exporting..." : "Export as PNG"}</span>
          </button>
          <div className="flex items-center gap-3">
            <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2 cursor-pointer hover-lift border border-gray-300 px-4 py-2 rounded-lg"
            >
            Start from Template
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 animate-in">
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <TaskLibrary
              tasks={tasks}
              onAddTask={openModal}
            />
          </aside>

          <section className="col-span-12 md:col-span-8 lg:col-span-9 w-full min-w-0">
            <WeeklyGrid
              scheduledTasks={scheduledTasks}
              onSaveDay={openSaveRoutineModal}
              onDeleteTask={removeScheduledTask}
              innerRef={gridRef}
            />
          </section>
        </div>

        <section className="mt-12 animate-in">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wide">
            Saved Routines
          </h2>

          {loadingRoutines ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Loading routines…</p>
          ) : savedRoutines.length === 0 ? (
            <EmptyState
              type="routines"
              onAction={handleOpenModal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRoutines.map((routine) => (
                <RoutineCard
                  key={routine._id}
                  routine={routine}
                  tasks={tasks}
                  activeRoutine={activeRoutine}
                  setActiveRoutine={setActiveRoutine}
                  fetchRoutines={fetchRoutines}
                />
              ))}
            </div>
          )}
        </section>

        {isModalOpen && (
          <TaskFormModal
            task={null}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}

        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md box-border transform scale-100 transition-all duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Save {selectedDay} Routine
              </h3>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Routine Name</label>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Routine name"
                    className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description (optional)"
                    rows="3"
                    className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  onClick={confirmSaveRoutine}
                  disabled={!routineName.trim()}
                >
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        )}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
            <div className="card card-primary w-full max-w-2xl animate-in delay-100 bg-white p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-main">Choose a Template</h3>
                <button onClick={() => setIsTemplateModalOpen(false)} className="text-gray-500 hover:text-black">✕</button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Day</label>
                <select 
                  value={selectedTemplateDay}
                  onChange={(e) => setSelectedTemplateDay(e.target.value)}
                  className="w-full border-soft rounded-lg px-3 py-2 bg-transparent"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {routineTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleAdoptTemplate(template)}
                    className="text-left p-4 border rounded-xl hover:border-blue-500 transition-colors"
                  >
                    <h4 className="font-bold text-gray-900">{template.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 shadow-2xl text-slate-800 dark:text-slate-200 text-sm font-semibold max-w-xs truncate">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}
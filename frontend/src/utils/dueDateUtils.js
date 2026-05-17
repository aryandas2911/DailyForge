const TIMEZONE_STORAGE_KEY = "dailyforgeTimezone";

export const getTimeZonePreference = () => {
  if (typeof window === "undefined") {
    return "local";
  }

  return localStorage.getItem(TIMEZONE_STORAGE_KEY) || "local";
};

export const setTimeZonePreference = (value) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TIMEZONE_STORAGE_KEY, value);
};

export const resolveHasTime = (dueDateValue, hasTime) => {
  if (typeof hasTime === "boolean") {
    return hasTime;
  }

  if (!dueDateValue || typeof dueDateValue !== "string") {
    return false;
  }

  if (!dueDateValue.includes("T")) {
    return false;
  }

  return !/T00:00/.test(dueDateValue);
};

export const formatDueLabel = (
  dueDateValue,
  { withWeekday = false, hasTime } = {}
) => {
  if (!dueDateValue) {
    return "";
  }

  const dueDate = new Date(dueDateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return "";
  }

  const timeZone = getTimeZonePreference();
  const dateOptions = withWeekday ? { weekday: "short" } : {};

  if (timeZone !== "local") {
    dateOptions.timeZone = timeZone;
  }

  const dateLabel = dueDate.toLocaleDateString("en-US", dateOptions);
  const showTime = resolveHasTime(dueDateValue, hasTime);

  if (!showTime) {
    return dateLabel;
  }

  const timeLabel = dueDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone !== "local" ? { timeZone } : {}),
  });

  const tzSuffix = timeZone === "UTC" ? " UTC" : "";
  return `${dateLabel} ${timeLabel}${tzSuffix}`;
};

export const formatRelativeDue = (dueDateValue, { hasTime } = {}) => {
  if (!dueDateValue) {
    return "";
  }

  const dueDate = new Date(dueDateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return "";
  }

  const showTime = resolveHasTime(dueDateValue, hasTime);

  if (!showTime) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );
    const diffDays = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    }

    if (diffDays === 0) {
      return "Due today";
    }

    return `in ${diffDays}d`;
  }

  const diffMs = dueDate.getTime() - Date.now();
  if (diffMs <= 0) {
    return "Overdue";
  }

  const totalMinutes = Math.ceil(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `in ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }

  return `in ${minutes}m`;
};

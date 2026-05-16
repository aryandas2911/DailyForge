import api from "./axios";

export async function fetchRoutines() {
  try {
    const res = await api.get("/routines");
    return res.data.routines || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function addRoutine(routineData) {
  try {
    const res = await api.post("/routines", routineData);
    return true;
  } catch (err) {
    console.error(err);
    // throw err;
  }
}
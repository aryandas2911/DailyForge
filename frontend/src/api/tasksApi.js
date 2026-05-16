import api from "./axios";

export async function getTasks() {
    try {
        const tasks = await api.get("/tasks");
        if(tasks){
            return tasks.data.tasks;
        }
        return null;
    } catch (error) {
        console.log(error?.response?.data?.message || "Failed to load tasks");   
    }
    return null;
}


export async function addTask(taskData) {
    try {
        const response = await api.post("/tasks", taskData);

        if(response && response.data){
            return response?.data?.newTask;
        }
        return null;
    } catch (error) {
        console.log(error?.response?.data?.message || "Failed to add task");
        return null;
    }
}

export async function updateTask(id, updates) {
    try {
        await api.put(`/tasks/${id}`, updates);
        return true;
    } catch (error) {
        console.log(error?.response?.data?.message || "Failed to update task");
        return false;
    }
}

export async function deleteTask(id) {
    try {
        await api.delete(`/tasks/${id}`);
        return true;
    } catch (error) {
        console.log(error?.response?.data?.message || "Failed to delete task");
        return false;
    }
}
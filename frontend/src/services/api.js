import axios from "axios";

const API_URL = "http://localhost:8000";

export const getTasks = () => axios.get(`${API_URL}/tasks`);

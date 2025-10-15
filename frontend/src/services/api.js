const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth header if token exists
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Something went wrong');
            }

            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async registerUser(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async loginUser(credentials) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
        this.setToken(result.access_token);
        return result;
    }

    logoutUser() {
        this.removeToken();
    }

    // Task methods
    async getTasks(userId) {
        const response = await this.request(`/tasks?user_id=${userId}`);

        // Normalize field names from snake_case to camelCase
        const normalizeTask = (task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date, // Map due_date to dueDate
            userId: task.user_id,
            createdAt: task.created_at,
            updatedAt: task.updated_at
        });

        // Handle different response structures
        if (Array.isArray(response)) {
            return response.map(normalizeTask);
        } else if (response.tasks && Array.isArray(response.tasks)) {
            return {
                ...response,
                tasks: response.tasks.map(normalizeTask)
            };
        } else if (response.data && Array.isArray(response.data)) {
            return {
                ...response,
                data: response.data.map(normalizeTask)
            };
        }

        return response;
    }

    async createTask(taskData, userId) {
      const { user_id, ...taskBody } = taskData;
      const actualUserId = userId || user_id;

      // Convert camelCase back to snake_case for API
      const apiTaskData = { ...taskBody };
      if (apiTaskData.dueDate) {
          apiTaskData.due_date = apiTaskData.dueDate;
          delete apiTaskData.dueDate;
      }

      return this.request(`/tasks?user_id=${actualUserId}`, {
        method: 'POST',
        body: apiTaskData
      });
    }

    // UPDATE TASK METHOD
    async updateTask(taskId, taskData) {
        // Convert camelCase back to snake_case for API
        const apiTaskData = { ...taskData };
        if (apiTaskData.dueDate) {
            apiTaskData.due_date = apiTaskData.dueDate;
            delete apiTaskData.dueDate;
        }

        return this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: apiTaskData
        });
    }

    // GET TASK BY ID METHOD
    async getTaskById(taskId) {
        const response = await this.request(`/tasks/${taskId}`);

        // Normalize field names from snake_case to camelCase
        return {
            id: response.id,
            title: response.title,
            description: response.description,
            status: response.status,
            priority: response.priority,
            dueDate: response.due_date,
            userId: response.user_id,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        };
    }

    async deleteTask(taskId) {
        return this.request(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
}

// Create instance
const apiService = new ApiService();

// Export named exports for the functions the components are using
export const registerUser = (userData) => apiService.registerUser(userData);
export const loginUser = (credentials) => apiService.loginUser(credentials);
export const logoutUser = () => apiService.logoutUser();
export const getTasks = (userId) => apiService.getTasks(userId);
export const createTask = (taskData, userId) => apiService.createTask(taskData, userId);
export const updateTask = (taskId, updates) => apiService.updateTask(taskId, updates);
export const getTaskById = (taskId) => apiService.getTaskById(taskId);
export const deleteTask = (taskId) => apiService.deleteTask(taskId);

// Also export the default instance
export default apiService;
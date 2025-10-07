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
        return this.request(`/tasks?user_id=${userId}`);
    }

    async createTask(taskData, userId) {
      const { user_id, ...taskBody } = taskData;
      const actualUserId = userId || user_id;

      return this.request(`/tasks?user_id=${actualUserId}`, {
        method: 'POST',
        body: taskBody
      });
    }

    async updateTask(taskId, updates) {
        return this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: updates
        });
    }

    async deleteTask(taskId) {
        return this.request(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
}

// Create instance
const apiService = new ApiService();

// Export named exports for the functions your components are using
export const registerUser = (userData) => apiService.registerUser(userData);
export const loginUser = (credentials) => apiService.loginUser(credentials);
export const logoutUser = () => apiService.logoutUser();
export const getTasks = (userId) => apiService.getTasks(userId);
export const createTask = (taskData) => apiService.createTask(taskData);
export const updateTask = (taskId, updates) => apiService.updateTask(taskId, updates);
export const deleteTask = (taskId) => apiService.deleteTask(taskId);

// Also export the default instance
export default apiService;
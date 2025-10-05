// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api';

// Clase para manejar las peticiones HTTP
class API {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Métodos GET
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // Métodos POST
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Métodos PUT
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Métodos DELETE
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Instancia global de la API
const api = new API(API_BASE_URL);

// Funciones específicas para cada microservicio
const AlumnosAPI = {
    getAll: () => api.get('/alumnos/asistencias'),
    getById: (id) => api.get(`/alumnos/asistencias/${id}`),
    create: (data) => api.post('/alumnos/asistencias', data),
    update: (id, data) => api.put(`/alumnos/asistencias/${id}`, data),
    delete: (id) => api.delete(`/alumnos/asistencias/${id}`),
};

const DocentesAPI = {
    getAll: () => api.get('/docentes/asistencias'),
    getById: (id) => api.get(`/docentes/asistencias/${id}`),
    create: (data) => api.post('/docentes/asistencias', data),
    update: (id, data) => api.put(`/docentes/asistencias/${id}`, data),
    delete: (id) => api.delete(`/docentes/asistencias/${id}`),
};

const DirectivosAPI = {
    getAll: () => api.get('/directivos/asistencias'),
    getById: (id) => api.get(`/directivos/asistencias/${id}`),
    create: (data) => api.post('/directivos/asistencias', data),
    update: (id, data) => api.put(`/directivos/asistencias/${id}`, data),
    delete: (id) => api.delete(`/directivos/asistencias/${id}`),
};

const AdministrativosAPI = {
    getAll: () => api.get('/administrativos/asistencias'),
    getById: (id) => api.get(`/administrativos/asistencias/${id}`),
    create: (data) => api.post('/administrativos/asistencias', data),
    update: (id, data) => api.put(`/administrativos/asistencias/${id}`, data),
    delete: (id) => api.delete(`/administrativos/asistencias/${id}`),
};

const VigilanciaAPI = {
    getAll: () => api.get('/vigilancia/asistencias'),
    getById: (id) => api.get(`/vigilancia/asistencias/${id}`),
    create: (data) => api.post('/vigilancia/asistencias', data),
    update: (id, data) => api.put(`/vigilancia/asistencias/${id}`, data),
    delete: (id) => api.delete(`/vigilancia/asistencias/${id}`),
};

const ReportesAPI = {
    getGeneral: () => api.get('/reportes/reporte-general'),
    getPorTipo: (tipo, fechaInicio, fechaFin) => {
        let endpoint = `/reportes/reporte-por-tipo/${tipo}`;
        if (fechaInicio && fechaFin) {
            endpoint += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        }
        return api.get(endpoint);
    },
};
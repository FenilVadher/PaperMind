import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  },

  // Upload PDF file
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 413) {
        throw new Error('File too large. Maximum size is 16MB.');
      }
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    }
  },

  // Generate summaries
  generateSummaries: async (filename) => {
    try {
      const response = await api.post('/summarize', { filename });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate summaries');
    }
  },

  // Generate glossary
  generateGlossary: async (filename) => {
    try {
      const response = await api.post('/glossary', { filename });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate glossary');
    }
  },

  // Generate flashcards
  generateFlashcards: async (filename, numCards = 8) => {
    try {
      const response = await api.post('/flashcards', { filename, num_cards: numCards });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate flashcards');
    }
  },

  // List uploaded files
  listFiles: async () => {
    try {
      const response = await api.get('/files');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to list files');
    }
  },

  // Advanced Analysis Features
  post: async (endpoint, data) => {
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || `Failed to ${endpoint}`);
    }
  },

  // Citation Analysis
  analyzeCitations: async (filename) => {
    try {
      const response = await api.post('/analyze/citations', { filename });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to analyze citations');
    }
  },

  // Methodology Analysis
  analyzeMethodology: async (filename) => {
    try {
      const response = await api.post('/analyze/methodology', { filename });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to analyze methodology');
    }
  },

  // Semantic Search
  semanticSearch: async (filename, query) => {
    try {
      const response = await api.post('/search/semantic', { filename, query });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to perform semantic search');
    }
  },

  // Related Papers
  findRelatedPapers: async (filename, title) => {
    try {
      const response = await api.post('/analyze/related-papers', { filename, title });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to find related papers');
    }
  },

  // Research Gaps
  identifyResearchGaps: async (filename) => {
    try {
      const response = await api.post('/analyze/research-gaps', { filename });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to identify research gaps');
    }
  },

  // Concept Map
  createConceptMap: async (filename) => {
    try {
      const response = await api.post('/analyze/concept-map', { filename });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create concept map');
    }
  },

  // Paper Comparison
  comparePapers: async (filenames) => {
    try {
      const response = await api.post('/compare/papers', { filenames });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to compare papers');
    }
  },
};

export default api;

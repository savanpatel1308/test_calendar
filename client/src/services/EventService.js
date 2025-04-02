import axios from 'axios';

const EventService = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await axios.get('/api/events');
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await axios.post('/api/events', eventData);
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Update an event
  updateEvent: async (id, eventData) => {
    try {
      const response = await axios.put(`/api/events/${id}`, eventData);
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Delete an event
  deleteEvent: async (id) => {
    try {
      const response = await axios.delete(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Update attendance status
  updateAttendanceStatus: async (id, status) => {
    try {
      const response = await axios.patch(`/api/events/${id}/attend`, { status });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default EventService;
// Configuration for different environments
const config = {
  development: {
    API_URL: 'http://localhost:5000/api',
  },
  production: {
    API_URL: '/api', // Relative path since frontend and backend are on same domain
  }
};

// Determine environment - if we're on localhost, use development config
const isProduction = window.location.hostname !== 'localhost';
const environment = isProduction ? 'production' : 'development';

export const API_URL = config[environment].API_URL;
export const GOOGLE_CLIENT_ID = '347188652133-imqpjp4qdfjf22vqcgvlvqmm5qsgsr4t.apps.googleusercontent.com';

export default {
  API_URL,
  GOOGLE_CLIENT_ID,
};
// Configuration for environment variables

export default {
    API_URL: process.env.API_URL || 'http://localhost:3000',
    DB_CONNECTION: process.env.DB_CONNECTION || 'mongodb://localhost:27017/myapp',
    JWT_SECRET: process.env.JWT_SECRET || 'your_secret_key',
    // Add other environment variables here
};
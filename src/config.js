import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3009

// si se tiene variable de entorno se toma PORT, sino 3000

export const DB_HOST = process.env.DB_HOST || 'localhost' //'192.168.1.9' //'192.168.56.1' // 
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || '123'
export const DB_NAME = process.env.DB_NAME || 'sarlaftt'
export const DB_PORT = process.env.DB_PORT || '3306'
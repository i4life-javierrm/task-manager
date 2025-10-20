// Define la interfaz de usuario para el frontend
export interface User {
    _id: string;
    username: string;
    // La propiedad 'isAdmin' es usada en el backend (user.model.js) y el template (admin.page_v2.html)
    role: string;
    // Mongoose timestamps
    createdAt: string; 
    updatedAt: string;
}

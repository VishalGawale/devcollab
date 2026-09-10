const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

export const API_BASE_URL = API_URL;
export const WEBSOCKET_URL = API_URL.replace(/^http/, "ws");

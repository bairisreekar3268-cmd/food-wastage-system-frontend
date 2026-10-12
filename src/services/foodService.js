import api from "./api";

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

export const getFood = (params) => api.get("/food", { params: clean(params) }).then((r) => r.data);
export const getFoodById = (id) => api.get(`/food/${id}`).then((r) => r.data);
export const createFood = (body) => api.post("/food", body).then((r) => r.data);
export const updateFood = (id, body) => api.put(`/food/${id}`, body).then((r) => r.data);
export const deleteFood = (id) => api.delete(`/food/${id}`);
export const getCategories = () => api.get("/categories").then((r) => r.data);
export const getSummary = (params) => api.get("/summary", { params: clean(params) }).then((r) => r.data);
export const getPrediction = (name) => api.get("/predict", { params: { name } }).then((r) => r.data);

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/",
  withCredentials: true,
});

// request:
apiClient.interceptors.request.use(
  (config) => {
    console.log("request sent");
    return config;
  },
  (error) => {
    console.log("request error", error.message);
    return Promise.reject(error);
  },
);

//  response:
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Unauthorized || Forrbidden");

      //    redirect to login page
    }
    return Promise.reject(error);
  },
);

export default apiClient;

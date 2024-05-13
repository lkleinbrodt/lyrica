import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://www.coyote-ai.com/lyrica/",
});

export default axiosInstance;

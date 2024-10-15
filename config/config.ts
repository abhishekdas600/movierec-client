import axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://d34afb8hrg58v2.cloudfront.net",
  withCredentials: true, 
});

export default axiosInstance;

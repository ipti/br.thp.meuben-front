import axios from "axios";

const publicHttp = axios.create({
  baseURL: process.env.REACT_APP_API_PATH,
});

export default publicHttp;

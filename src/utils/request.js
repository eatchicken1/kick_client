import axios from 'axios';

const service = axios.create({
    baseURL: '/api',
});

service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        console.log(error);
        return Promise.reject(error);
    }
);

export default service;

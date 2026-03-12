import request from '../utils/request';

const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}

export const getThreePressureProfileListApi = (data) => {
    return request({
        url: getAddress("ThreePressureProfile/GetList"),
        method: 'get',
        params: data,
    });
}

export const saveThreePressureProfileApi = (data) => {
    return request({
        url: getAddress("ThreePressureProfile/InsertOrUpdate"),
        method: 'post',
        data: data,
    });
}

export const deleteThreePressureProfileApi = (data) => {
    return request({
        url: getAddress("ThreePressureProfile/Delete"),
        method: 'post',
        data: data,
    });
}
import request from '../utils/request';

 const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}

export const getBhaListApi = (data) => {
    return request({
        url: getAddress("Bha/GetBhaList"),
        method: 'get',
        params: data,
    });
}

export const getComponentListApi = (data) => {
    return request({
        url: getAddress("Bha/GetComponentList"),
        method: 'get',
        params: data,
    });
}

export const saveBhaApi = (data) => {
    return request({
        url: getAddress("Bha/InsertOrUpdateBha"),
        method: 'post',
        data: data,
    });
}

export const saveComponentApi = (data) => {
    return request({
        url: getAddress("Bha/InsertOrUpdateComponent"),
        method: 'post',
        data: data,
    });
}

export const deleteBhaApi = (data) => {
    return request({
        url: getAddress("Bha/DeleteBha"),
        method: 'post',
        data: data,
    });
}

export const deleteComponentApi = (data) => {
    return request({
        url: getAddress("Bha/DeleteComponent"),
        method: 'post',
        data: data,
    });
}
import request from '../utils/request';

const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}

export const getMudListApi = (data) => {
    return request({
        url: getAddress("Mud/GetMudList"),
        method: 'get',
        params: data,
    });
}

export const saveMudApi = (data) => {
    return request({
        url: getAddress("Mud/InsertOrUpdate"),
        method: 'post',
        data: data,
    });
}

export const deleteMudApi = (data) => {
    return request({
        url: getAddress("Mud/Delete"),
        method: 'post',
        data: data,
    });
}
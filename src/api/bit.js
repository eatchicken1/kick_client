import request from '../utils/request';

 const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}

export const getBitListApi = (data) => {
    return request({
        url: getAddress("Bit/GetList"),
        method: 'get',
        params: data,
    });
}

export const saveBitApi = (data) => {
    return request({
        url: getAddress("Bit/InsertOrUpdate"),
        method: 'post',
        data: data,
    });
}

export const deleteBitApi = (data) => {
    return request({
        url: getAddress("Bit/Delete"),
        method: 'post',
        data: data,
    });
}
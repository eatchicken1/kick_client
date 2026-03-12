import request from '../utils/request';

const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}


export const getWellStructureListApi = (data) => {
    return request({
        url: getAddress("WellStructure/GetWellStructureList"),
        method: 'get',
        params: data,
    });
}

export const getCasingListApi = (data) => {
    return request({
        url: getAddress("WellStructure/GetCasingList"),
        method: 'get',
        params: data,
    });
}

export const saveWellStructureApi = (data) => {
    return request({
        url: getAddress("WellStructure/InsertOrUpdateWellStructure"),
        method: 'post',
        data: data,
    });
}

export const deleteWellStructureApi = (data) => {
    return request({
        url: getAddress("WellStructure/DeleteWellStructure"),
        method: 'post',
        data: data,
    });
}

export const saveCasingApi = (data) => {
    return request({
        url: getAddress("WellStructure/InsertOrUpdateCasing"),
        method: 'post',
        data: data,
    });
}

export const deleteCasingApi = (data) => {
    return request({
        url: getAddress("WellStructure/DeleteCasing"),
        method: 'post',
        data: data,
    });
}
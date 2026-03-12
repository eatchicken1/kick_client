import request from '../utils/request';

 const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}


//离散轨迹
export const getSurveydataApi = (data) => {
    return request({
        url: getAddress("Survey/GetInitData"),
        method: 'get',
        params: data,
    });
}

//保存井眼轨迹单点数据
export const saveSurveyApi = (data) => {
    return request({
        url: getAddress("Survey/InsertOrUpdate"),
        method: 'post',
        data: data,
    });
}

//删除井眼轨迹单点数据
export const deleteSurveyApi = (data) => {
    return request({
        url: getAddress("Survey/Delete"),
        method: 'DELETE',
        data: data,
    });
}

export const discreteSurveyApi = (data) => {
    return request({
        url: getAddress("Survey/Calc"),
        method: 'post',
        data: data,
    });
}
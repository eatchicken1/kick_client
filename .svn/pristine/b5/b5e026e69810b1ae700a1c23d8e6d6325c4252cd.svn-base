import request from '../utils/request';

 const URL = "http://localhost:17600/api/";
//const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}


//离散轨迹
export const getTrajectorydataApi = (data) => {
    return request({
        url: getAddress("Trajectory/GetInitData"),
        method: 'get',
        params: data,
    });
}

//保存井眼轨迹单点数据
export const saveTrajectoryApi = (data) => {
    return request({
        url: getAddress("Trajectory/InsertOrUpdate"),
        method: 'post',
        data: data,
    });
}

//删除井眼轨迹单点数据
export const deleteTrajectoryApi = (data) => {
    return request({
        url: getAddress("Trajectory/Delete"),
        method: 'DELETE',
        data: data,
    });
}

export const discreteTrajectoryApi = (data) => {
    return request({
        url: getAddress("Trajectory/Calc"),
        method: 'post',
        data: data,
    });
}
import request from '../utils/request';

const URL = "http://localhost:17600/api/";
//  const URL = "http://39.96.65.89:7780/api/";

const getAddress = (s) => {
    return URL + s;
}

export const fetchApidata = (url, data, method) => {
    if (method == 'post') {
        return request({
            url: getAddress(url),
            method: 'post',
            timeout: 60000,
            data: data,
        });
    }
    else if(method == 'get') {
        return request({
            url: getAddress(url),
            method: 'get',
            timeout: 60000,
            params: data,
        });
    }
    else if(method == 'delete') {
        return request({
            url: getAddress(url),
            method: 'delete',
            params: data,
        });
    }
}
//钻头磨损数据请求
export const BitWearApi = (data) => {
    return request({
        url: getAddress("BitWear/Calc"),
        method: 'get',
        params: data,
    });
}
//钻井效率数据请求
export const MSEApi = (data) => {
    return request({
        url: getAddress("MSECalc/Calc"),
        method: 'get',
        params: data,
    });
}
//钻压扭矩传递数据请求
export const WOBTorqueApi = (data) => {
    return request({
        url: getAddress("BitLoad/Calc"),
        method: 'post',
        data: data,
    });
}
//粘滑振动
export const StickSilpApi = (data) => {
    return request({
        url: getAddress("StickSilpVibration/Calc"),
        method: 'get',
        params: data,
    });
}
//可钻性
export const DrillabilityCalcApi = (data) => {
    return request({
        url: getAddress("DrillabilityCalc/Calc"),
        method: 'get',
        params: data,
    });
}
//实时优化
export const OptimApi = (data) => {
    return request({
        url: getAddress("Optim/Calc"),
        method: 'get',
        params: data,
    });
}//实时优化
export const porePressureApi = (data) => {
    return request({
        url: getAddress("Ppdcpressure/Ppdcpressure"),
        method: 'get',
        params: data,
    });
}
// 水平投影数据请求
export const getHorizontalData = () => {
    return request({
        url: './horizontalData.json',
        method: 'get',
    });
}
// 井身结构绘制数据
export const wellStructureData = () => {
    return request({
        url: './wellStructure.json',
        method: 'get',
    });
}
// 垂直投影数据请求
export const getVerticalData = () => {
    return request({
        url: './verticalData.json',
        method: 'get'
    });
}
// 3D数据请求
export const getThreeData = () => {
    return request({
        url: './threeData.json',
        method: 'get'
    });
}
// 钻具相关数据
export const getData = () => {
    return request({
        url: './bhzData.json',
        method: 'get'
    });
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
//轨迹离散
export const discreteSurveyApi = (data) => {
    return request({
        url: getAddress("Survey/Calc"),
        method: 'post',
        data: data,
    });
}
//摩擦系数计算
export const HoleFcCalc1 = (data) => {
    return request({
        url: getAddress("FcCalc/Calc"),
        method: 'post',
        data: data,
    });
}
//钻柱空转地面扭矩计算
// TorqueOffBottom1
export const TorqueOffBottom1 = (data) => {
    return request({
        url: getAddress("TripWellHeadLoad/TripWellHeadLoadCalc"),
        method: 'post',
        data: data,
    });
}
//起下钻井口载荷计算 
export const TripAnalysis1 = (data) => {
    return request({
        url: getAddress("TripWellHeadLoad/TripWellHeadLoadCalc"),
        method: 'post',
        data: data,
    });
}
//起下钻井口载荷计算 
export const TripData = (data) => {
    return request({
        url: getAddress("TripData/Calc"),
        method: 'get',
        params: data,
    });
}
//井口载荷计算 
export const WellHeadLoad = (data) => {
    return request({
        url: getAddress("WellHeadLoad/WellHeadLoadCalc"),
        method: 'post',
        data: data,
    });
}


//悬重实时监测
export const TripIdentification = (data) => {
    return request({
        url: getAddress("TripIdentification/Calc"),
        method: 'get',
        params: data,
    });
}

//实际悬重
export const RealData = (data) => {
    return request({
        url: getAddress("RealData/Calc"),
        method: 'get',
        params: data,
    });
}
//工况监测
export const Activestatus = (data) => {
    return request({
        url: getAddress("Activestatus/Status"),
        method: 'get',
        params: data,
    });
}
//工况监测2
export const Activestatus2 = (data) => {
    return request({
        url: getAddress("Activestatus2/Status"),
        method: 'get',
        params: data,
    });
}
// 钻柱体积计算
export const volume1 = (data) => {
    return request({
        url: getAddress("Volume/InnerVolume"),
        method: 'get',
        params: data,
    });
}
export const volume2 = (data) => {
    return request({
        url: getAddress("Volume/AnularVolume"),
        method: 'get',
        params: data,
    });
}

export const volume3 = (data) => {
    return request({
        url: getAddress("Volume/WellboreVolume"),
        method: 'get',
        params: data,
    });
}

// 环空流变

export const annularRheology1 = (data) => {
    return request({
        url: getAddress("AnnularRheology/calc"),
        method: 'get',
        params: data,
    });
}
export const annularRheology2 = (data) => {
    return request({
        url: getAddress("Rheology/calc"),
        method: 'get',
        params: data,
    });
}

// 钻头水力参数
export const DrillBitParameter1 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/DrillbitPressure"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter2 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/PumpworkingPressure"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter3 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/BitJetSpeed"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter4 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/JetPower"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter5 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/DrillBitWaterPower"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter6 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/PumpworkingRealPower"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter7 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/DrillBitUnitWaterPower"),
        method: 'get',
        params: data,
    });
}
export const DrillBitParameter8 = (data) => {
    return request({
        url: getAddress("DrillBitParameter/PumpUtilization"),
        method: 'get',
        params: data,
    });
}

// 钻井液混合
export const DrillingfluidMixture1 = (data) => {
    return request({
        url: getAddress("DrillingfluidMixture/CristalStoneToAddDensity"),
        method: 'get',
        params: data,
    });
}
export const DrillingfluidMixture2 = (data) => {
    return request({
        url: getAddress("DrillingfluidMixture/WaterToLowDensity"),
        method: 'get',
        params: data,
    });
}
export const DrillingfluidMixture3 = (data) => {
    return request({
        url: getAddress("DrillingfluidMixture/ClayRequirement"),
        method: 'get',
        params: data,
    });
}
export const DrillingfluidMixture4 = (data) => {
    return request({
        url: getAddress("DrillingfluidMixture/DrillingfluidM"),
        method: 'get',
        params: data,
    });
}
// 管内及环空压耗计算
export const DrillingpipePressure1 = (data) => {
    return request({
        url: getAddress("DrillingpipePressure/BinInnerPipePressure"),
        method: 'get',
        params: data,
    });
}
export const DrillingpipePressure2 = (data) => {
    return request({
        url: getAddress("DrillingpipePressure/PowInnerPipePressure"),
        method: 'get',
        params: data,
    });
}
export const DrillingpipePressure3 = (data) => {
    return request({
        url: getAddress("DrillingpipePressure/BinAnnularPipePressure"),
        method: 'get',
        params: data,
    });
}
export const DrillingpipePressure4 = (data) => {
    return request({
        url: getAddress("DrillingpipePressure/PowAnnularPipePressure"),
        method: 'get',
        params: data,
    });
}
// 管柱计算
export const DrillPipeMechanics1 = (data) => {
    return request({
        url: getAddress("DrillPipeMechanics/SinFsin"),
        method: 'get',
        params: data,
    });
}
export const DrillPipeMechanics2 = (data) => {
    return request({
        url: getAddress("DrillPipeMechanics/SpiralFspiral"),
        method: 'get',
        params: data,
    });
}
export const DrillPipeMechanics3 = (data) => {
    return request({
        url: getAddress("DrillPipeMechanics/Radius"),
        method: 'get',
        params: data,
    });
}
export const DrillPipeMechanics4 = (data) => {
    return request({
        url: getAddress("DrillPipeMechanics/GuanXingJu"),
        method: 'get',
        params: data,
    });
}
export const DrillPipeMechanics5 = (data) => {
    return request({
        url: getAddress("DrillPipeMechanics/MaxRadius"),
        method: 'get',
        params: data,
    });
}
export const DrillPipeMechanics6 = (data) => {
    return request({
        url: getAddress("DrillPipeMechanics/BuoyantF"),
        method: 'get',
        params: data,
    });
}
// 解卡计算
export const stuckreleased1 = (data) => {
    return request({
        url: getAddress("StuckReleased/StickPointDepth"),
        method: 'get',
        params: data,
    });
}
export const stuckreleased2 = (data) => {
    return request({
        url: getAddress("StuckReleased/DrillingPipeAllowedTorsionTurnsNumber"),
        method: 'get',
        params: data,
    });
}
export const stuckreleased3 = (data) => {
    return request({
        url: getAddress("StuckReleased/StuckReleasedAgentAmount"),
        method: 'get',
        params: data,
    });
}
export const stuckreleased4 = (data) => {
    return request({
        url: getAddress("StuckReleased/InjectionMaximumPumpPressureofStuckReleasedAgent"),
        method: 'get',
        params: data,
    });
}


// 井控计算
export const wellcontrol1 = (data) => {
    return request({
        url: getAddress("WellControl/OilGasUpwellingSpeedCalculationDelayedTime"),
        method: 'get',
        params: data,
    });
}
export const wellcontrol2 = (data) => {
    return request({
        url: getAddress("WellControl/ShutinStandPipePressure"),
        method: 'get',
        params: data,
    });
}
export const wellcontrol3 = (data) => {
    return request({
        url: getAddress("WellControl/KickWellDensity"),
        method: 'get',
        params: data,
    });
}
export const wellcontrol4 = (data) => {
    return request({
        url: getAddress("WellControl/InitialStandPipeTotalPressure"),
        method: 'get',
        params: data,
    });
}
export const wellcontrol5 = (data) => {
    return request({
        url: getAddress("WellControl/FinalStandPipeTotalPressure"),
        method: 'get',
        params: data,
    });
}
export const wellcontrol6 = (data) => {
    return request({
        url: getAddress("WellControl/ReachBitTime"),
        method: 'get',
        params: data,
    });
}
export const wellcontrol7 = (data) => {
    return request({
        url: getAddress("WellControl/ReachSurfaceTime"),
        method: 'get',
        params: data,
    });
}





//井眼清洁计算 
export const WellboreClean1 = (data) => {
    return request({
        url: getAddress("WellboreClean/BoreholeCleanCapacityCalc"),
        method: 'get',
        data: data,
    });
}
export const WellboreClean2 = (data) => {
    return request({
        url: getAddress("WellboreClean/CuttingsBedThicknessCalc"),
        method: 'get',
        data: data,
    });
}
export const WellboreClean3 = (data) => {
    return request({
        url: getAddress("WellboreClean/CuttingSlidingSpeedCalc"),
        method: 'get',
        data: data,
    });
}
//临界速度计算
export const CriticalVelocity1 = (data) => {
    return request({
        url: getAddress("CriticalVelocity/calc"),
        method: 'get',
        params: data,
    });
}
//起下钻波动压力计算
export const SurgeAndSwab1 = (data) => {
    return request({
        url: getAddress("SurgeAndSwab/calc"),
        method: 'get',
        params: data,
    });
}

//起下钻灌浆量计算
export const SurgeAndSwabVolume1 = (data) => {
    return request({
        url: getAddress("SurgeAndSwabVolume/calc"),
        method: 'get',
        params: data,
    });
}
//漏失压力计算
export const wellboremudloss1 = (data) => {
    return request({
        url: getAddress("WellboreMudLoss/Hydrostaticmethod"),
        method: 'get',
        params: data,
    });
}
export const wellboremudloss2 = (data) => {
    return request({
        url: getAddress("WellboreMudLoss/Circulatingmethod"),
        method: 'get',
        params: data,
    });
}
// //地层孔隙压力计算PpdcpressureCalc
// export const porePressureApi = (data) => {
//     return request({
//         url: getAddress("Ppdcpressure/Ppdcpressure"),
//         method: 'get',
//         params: data,
//     });
// }


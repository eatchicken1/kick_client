<template>
    <div>
        <span>井口载荷实时计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="120px">
                    <el-form-item label="钻头深度">
                        <el-input class="input" v-model="BitDepth">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井底扭矩">
                        <el-input class="input" v-model="BitTorque">
                            <template slot="append">kN·m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井底钻压">
                        <el-input class="input" v-model="BitWOB">
                            <template slot="append">kN</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="转盘转速">
                        <el-input class="input" v-model="RPM">
                            <template slot="append">r/min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="运行速度">
                        <el-input class="input" v-model="AxialSpeed">
                            <template slot="append">m/min</template>
                        </el-input> </el-form-item
                    >
                    <el-form-item label="泥浆密度">
                        <el-input class="input" v-model="InnerMudDensity">
                            <template slot="append">g/cm3</template>
                        </el-input> 
                     </el-form-item>
                     
                    <el-form-item label="泥浆排量">
                        <el-input class="input" v-model="FlowRate">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="管内摩擦系数">
                        <el-input class="input" v-model="CaseFc"> </el-input>
                    </el-form-item>
                    <el-form-item label="管外摩擦系数">
                        <el-input class="input" v-model="HoleFc"> </el-input>
                    </el-form-item>
                    <el-form-item label="钻进方式">
                        <el-select v-model="MoveCondition" @change="selectChange" class="input">
                            <el-option label="旋转钻进" value="旋转钻进"></el-option>
                            <el-option label="滑动钻进" value="滑动钻进"></el-option>
                            <el-option label="复合钻进" value="复合钻进"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="钻井液粘滞力">
                        <el-radio-group v-model="IsViscousEffect" @change="radioChange">
                            <el-radio label="false">不考虑</el-radio>
                            <el-radio label="ture">考虑</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 70px">计算</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="9">
                <div id="AxialLoad" style="width: 600px; height: 700px"></div>
            </el-col>
            <el-col :span="9">
                <div id="TorqueLoad" style="width: 600px; height: 700px"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { WellHeadLoad } from '../../api/index';
var AxialLoadoption = {
    title: {
        text: '轴向载荷分析结果',
        bottom: '3%',
        left: 'center'
    },
    tooltip: {
        axisPointer: {
            axis: 'y'
        },
        trigger: 'axis',
        formatter: function (params) {
            var relVal = params[0].name;
            var val = '井深:' + params[0].value[1] + '(m)';
            for (var i = 0, l = params.length; i < l; i++) {
                if (params[i].value) {
                    relVal += '<br/> ' + params[i].marker + params[i].seriesName + ' : ' + params[i].value[0] + '(kN)';
                }
            }
            relVal = val + relVal;
            return relVal;
        }
    },
    toolbox: {
        itemSize: 20,
        itemGap: 15,
        feature: {
            dataView: {
                show: true,
                readOnly: false,
                optionToContent: function (opt) {
                    var series = opt.series;
                    var table =
                        '<table border:1px solid #ccc; style="width:100%;user-select:text;text-align:center"><tbody><tr>' +
                        '<td>井深(m)</td>';
                    for (var i = 0; i < series.length; i++) {
                        table += '<td>' + series[i].name + '</td>';
                    }
                    table += '</tr>';
                    for (var i = 0, l = series[0].data.length; i < l; i++) {
                        table += '<tr>' + '<td>' + series[0].data[i][1] + '</td>';
                        for (var k = 0; k < series.length; k++) {
                            table += '<td>' + series[k].data[i][0] + '</td>';
                        }
                        table += '</tr>';
                    }
                    table += '</tbody></table>';
                    return table;
                }
            },
            saveAsImage: { show: true }
        }
    },
    legend: {
        data: ['轴向载荷'],
        bottom: '7%',
        left: '85%',
        textStyle: {
            fontSize: 14
        },
        orient: 'vertical'
    },
    grid: {
        left: '5%',
        top: '4%',
        right: '2%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: false,
        position: 'top',
        name: '轴向载荷(kN)',
        nameGap: 25,
        nameLocation: 'middle',
        nameTextStyle: {
            fontSize: 15
        },
        minorSplitLine: {
            show: true
        },
        minorTick: {
            show: true
        }
    },
    yAxis: {
        type: 'value',
        name: '井深(m)',
        inverse: true,
        nameGap: 40,
        inverse: true,
        nameLocation: 'middle',
        nameTextStyle: {
            fontSize: 15
        },
        minorSplitLine: {
            show: true
        },
        minorTick: {
            show: true
        }
    },
    series: [
        {
            name: '轴向载荷',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: []
        }
    ]
};
var TorqueLoadoption = {
    title: {
        text: '扭矩载荷分析结果',
        bottom: '3%',
        left: '40%'
    },
    tooltip: {
        axisPointer: {
            axis: 'y'
        },
        trigger: 'axis',
        formatter: function (params) {
            var relVal = params[0].name;
            var val = '井深:' + params[0].value[1] + '(m)';
            for (var i = 0, l = params.length; i < l; i++) {
                if (params[i].value) {
                    relVal += '<br/> ' + params[i].marker + params[i].seriesName + ' : ' + params[i].value[0] + '(kN·m)';
                }
            }
            relVal = val + relVal;
            return relVal;
        }
    },
    toolbox: {
        itemSize: 20,
        itemGap: 15,
        feature: {
            dataView: {
                show: true,
                readOnly: false,
                optionToContent: function (opt) {
                    var series = opt.series;
                    var table =
                        '<table border:1px solid #ccc; style="width:100%;user-select:text;text-align:center"><tbody><tr>' +
                        '<td>井深(m)</td>';
                    for (var i = 0; i < series.length; i++) {
                        table += '<td>' + series[i].name + '</td>';
                    }
                    table += '</tr>';
                    for (var i = 0, l = series[0].data.length; i < l; i++) {
                        table += '<tr>' + '<td>' + series[0].data[i][1] + '</td>';
                        for (var k = 0; k < series.length; k++) {
                            table += '<td>' + series[k].data[i][0] + '</td>';
                        }
                        table += '</tr>';
                    }
                    table += '</tbody></table>';
                    return table;
                }
            },
            saveAsImage: { show: true }
        }
    },
    legend: {
        data: ['扭矩载荷'],
        bottom: '7%',
        left: '85%',
        textStyle: {
            fontSize: 13
        },
        orient: 'horizontal'
    },
    grid: {
        left: '5%',
        right: '2%',
        top: '4%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: false,
        position: 'top',
        name: '扭矩载荷(kN·m)',
        nameGap: 25,
        nameLocation: 'middle',
        nameTextStyle: {
            fontSize: 15
        },
        minorSplitLine: {
            show: true
        },
        minorTick: {
            show: true
        }
    },
    yAxis: {
        type: 'value',
        name: '井深(m)',
        inverse: true,
        nameGap: 40,
        nameLocation: 'middle',
        nameTextStyle: {
            fontSize: 15
        },
        minorSplitLine: {
            show: true
        },
        minorTick: {
            show: true
        }
    },
    series: [
        {
            name: '扭矩载荷',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: []
        }
    ]
};
export default {
    data() {
        return {
            AxialLoadChart: {},
            TorqueLoad: {},
            WellName: '高石130',
            MoveCondition: '旋转钻进',
            BitDepth: 4000,
            WellDepth: 4000,
            BitTorque: 5,
            BitWOB: 50,
            RPM: 60,
            AxialSpeed: 2,
            InnerMudDensity: 1.8,
            OuterMudDensity: 1.8,
            CaseFc: 0.2,
            HoleFc: 0.3,
            FlowRate: 20,
            IsViscousEffect: 'false'
        };
    },
    methods: {
        calc1() {
            WellHeadLoad({
                WellName: this.WellName,
                MoveCondition: this.MoveCondition,
                BitDepth: this.BitDepth,
                WellDepth: this.WellDepth,
                BitTorque: this.BitTorque,
                BitWOB: this.BitWOB,
                RPM: this.RPM,
                AxialSpeed: this.AxialSpeed,
                InnerMudDensity: this.InnerMudDensity,
                OuterMudDensity: this.OuterMudDensity,
                CaseFc: this.CaseFc,
                HoleFc: this.HoleFc,
                FlowRate: this.FlowRate,
                ViscousEffect: false
            })
                .then((res) => {
                    var AxialLoadData = [];
                    var TorquelLoadData = [];
                    for (var i = 0; i < res.content.length; i++) {
                        AxialLoadData.push([res.content[i].axialLoad, res.content[i].wellDepth]);
                        TorquelLoadData.push([res.content[i].torque, res.content[i].wellDepth]);
                    }
                    AxialLoadoption.series[0].data = AxialLoadData;
                    TorqueLoadoption.series[0].data = TorquelLoadData;
                    this.AxialLoadChart.setOption(AxialLoadoption);
                    this.TorqueLoadChart.setOption(TorqueLoadoption);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        change: function (Chart, option) {
            Chart.setOption(option);
        },
        selectChange(val) {
            this.MoveCondition = val;
        },
        radioChange(val) {
            this.IsViscousEffect = val;
        }
    },
    mounted() {
        this.AxialLoadChart = this.$echarts.init(document.getElementById('AxialLoad'),'dark');
        this.TorqueLoadChart = this.$echarts.init(document.getElementById('TorqueLoad'),'dark');
        this.change(this.AxialLoadChart, AxialLoadoption);
        this.change(this.TorqueLoadChart, TorqueLoadoption);
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
</style>
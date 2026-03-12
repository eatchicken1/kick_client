<template>
    <el-card id="HKLAcalc">
        <el-col :span="6" style="padding-right: 5px">
            <el-card>
                <div slot="header" class="clearfix">
                   
                    <!-- <span>理论与实测悬重对比监测时间设置</span> -->
                     <span> 钻进井口钩载、扭矩实时监测模块</span>
                </div>
                <el-form label-width="120px">
                    <el-form-item label="开始计算时间">
                        <el-date-picker v-model="StartTime" type="datetime" class="input" align="right"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button @click="startCalc" type="primary">开始计算</el-button>
                        <el-button @click="stopCalc" type="primary">停止计算</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-card style="margin-top: 5px">
                <div slot="header" class="clearfix">
                    <span>计算结果</span>
                </div>
                <el-form label-width="120px" :inline="true">
                    <el-form-item label="计算悬重">
                        <el-input class="input" v-model="hklacalc">
                            <template slot="append">KN</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="实测悬重">
                        <el-input class="input" v-model="measurehkla">
                            <template slot="append">KN</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="计算扭矩">
                        <el-input class="input" v-model="torqacalc">
                            <template slot="append">kN·m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="实测扭矩">
                        <el-input class="input" v-model="measuretorqa">
                            <template slot="append">kN·m</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
        <el-col :span="9">
            <el-card>
                <div id="calchkla" style="width: 95%; height: 870px; margin-left: 10px"></div>
                
            </el-card>
        </el-col>
         <el-col :span="9">
            <el-card>
              
                 <div id="calctorqa" style="width: 95%; height: 870px; margin-left: 10px"></div>
            </el-card>
        </el-col>
    </el-card>
</template>

<script>
const measurehklaoption = {
    grid: {
        top: '7%',
        right: '5%',
        left: '10%',
        bottom: '6%'
    },
    legend: {
        bottom: '2%',
        textStyle: {
            fontSize: 15
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    toolbox: {
        top: '0%',
        right: '3%',
        itemSize: 20,
        itemGap: 15,
        feature: {
            dataView: {
                show: true,
                readOnly: false,
                optionToContent: function (opt) {
                    var series = opt.series;
                    var table =
                        '<table border:1px solid #ccc; style="width:100%;user-select:text;text-align:center"><tbody><tr>' + '<td>深度</td>';
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
    dataZoom: [
        {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            start: 65,
            end: 100,
            bottom: '6%',
            height: 740,
            width: 15
        },
        {
            type: 'inside',
            yAxisIndex: [0],
            start: 60,
            end: 100
        }
    ],
    yAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 15,
        inverse: true,
        scale: true,
        nameTextStyle: {
            fontSize: 13
        }
    },
    xAxis: {
        name: '计算悬重',
        type: 'value',
        nameLocation: 'middle',
        nameGap: 25,
        min: 300,
        max: 3000,
        position: 'top',
        nameTextStyle: {
            fontSize: 15
        }
    },
    series: [
        {
            name: '计算悬重',
            type: 'line',
            symbol: 'none',
            data: [
                [1600, 2000],
                [1700, 2200],
                [1800, 2300],
                [2000, 2400]
            ]
        },
        {
            name: '实测悬重',
            type: 'line',
            symbol: 'none',
            data: [
                [1200, 2000],
                [1200, 2200],
                [1300, 2300],
                [2400, 2400]
            ]
        }
    ]
};
const measuretorqaoption = {
    grid: {
        top: '7%',
        right: '5%',
        left: '10%',
        bottom: '6%'
    },
    legend: {
        bottom: '2%',
        textStyle: {
            fontSize: 15
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    toolbox: {
        top: '0%',
        right: '3%',
        itemSize: 20,
        itemGap: 15,
        feature: {
            dataView: {
                show: true,
                readOnly: false,
                optionToContent: function (opt) {
                    var series = opt.series;
                    var table =
                        '<table border:1px solid #ccc; style="width:100%;user-select:text;text-align:center"><tbody><tr>' + '<td>深度</td>';
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
    dataZoom: [
        {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            start: 65,
            end: 100,
            bottom: '6%',
            height: 740,
            width: 15
        },
        {
            type: 'inside',
            yAxisIndex: [0],
            start: 60,
            end: 100
        }
    ],
    yAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 15,
        inverse: true,
        scale: true,
        nameTextStyle: {
            fontSize: 13
        }
    },
    xAxis: {
        name: '计算扭矩',
        type: 'value',
        nameLocation: 'middle',
        nameGap: 25,
        min: 0,
        max: 40,
        position: 'top',
        nameTextStyle: {
            fontSize: 15
        }
    },
    series: [
        {
            name: '计算扭矩',
            type: 'line',
            symbol: 'none',
            data: [
                [12, 2000],
                [13, 2200],
                [14, 2300],
                [12, 2400]
            ]
        },
        {
            name: '实测扭矩',
            type: 'line',
            symbol: 'none',
            data: [
                [13, 2000],
                [13, 2200],
                [13, 2300],
                [14, 2400]
            ]
        }
    ]
};
import { fetchApidata } from '../../api/index';
export default {
    name: 'HKLAcalc',
    data() {
        return {
            calcHKLAChart: {},
            calcTORQAChart: {},
            measurehkla: 0,
            hklacalc: 0,
            measuretorqa: 0,
            torqacalc: 0,
            loadding: null,
            clickTime: 0,
            // wellName: '龙004-X1',
            // StartTime: '2013/06/06 09:00:00',
            //  wellName: '高石130',
            //  StartTime: '2020/10/18 00:00:00',2021-11-22 14:58:14
              wellName: '长宁H232',
            //StartTime: '2018-07-10 18:48:23',
             StartTime: '2021-11-22 14:58:14',
            timer: null,
            
            changeData: null
        };
    },
    mounted() {
        this.calcHKLAChart = this.$echarts.init(document.getElementById('calchkla'), 'dark');
         this.calcTORQAChart = this.$echarts.init(document.getElementById('calctorqa'), 'dark');
        this.change(this.calcHKLAChart, measurehklaoption);
         this.change(this.calcTORQAChart, measuretorqaoption);
        this.startTime = this.$store.state.StartTime;
        this.wellName = this.$store.state.jh;
    },
    methods: {
        async HKLAmonitorcalc() {
            var data = { jh: this.wellName, time: this.StartTime };
            const res = await fetchApidata('Monitorw/Calc', data, 'get');
            this.count++;
            this.StartTime = res.content[1][res.content[1].length - 1].time;
            if (res.isSuccess) {
                var data = { jh: this.wellName, time: this.StartTime };
                //this.loadding.close();
               
                for (var i = 0; i < res.content[0].length - 1; i++) {
                    if (res.isSuccess) {
                         setTimeout(() => {
                        //measurehklaoption.series[0].data.push([res.content.hkla, res.content.bitDepth]);
                        measurehklaoption.series[0].data.push([res.content[1][i].hkla.toFixed(3), res.content[0][i].deptbitm]);
                        measurehklaoption.series[1].data.push([res.content[0][i].hkla.toFixed(3), res.content[0][i].deptbitm]);

                          measuretorqaoption.series[0].data.push([res.content[1][i].torqa.toFixed(3), res.content[0][i].deptbitm]);
                        measuretorqaoption.series[1].data.push([res.content[0][i].torqa.toFixed(3), res.content[0][i].deptbitm]);
                        this.hklacalc = res.content[1][i].hkla.toFixed(3);
                        this.measurehkla = res.content[0][i].hkla.toFixed(3);
                        this.torqacalc = res.content[1][i].torqa.toFixed(3);
                        this.measuretorqa = res.content[0][i].torqa.toFixed(3);
                        //this.changeData = temp;
                        console.log(res);
                        }, 2000);  
                    } else {
                        this.StartTime = res.content.startTime;
                    }
                }
                this.calcHKLAChart.setOption({
                    series: measurehklaoption.series
                });
                  this.calcTORQAChart.setOption({
                    series: measuretorqaoption.series
                });
            } else {
                this.loadding.close();
                clearInterval(this.timer);
                this.$message.error(res.message);
            }
        },
        startCalc: function () {
            if (this.clickTime == 0) {
                measurehklaoption.series[0].data = [];
                measurehklaoption.series[1].data = [];
                 measuretorqaoption.series[0].data = [];
                measuretorqaoption.series[1].data = [];
                this.clickTime = 1;
            }
            // const dom = document.querySelector('#HKLAcalc');
            // this.loadding = this.$loading({
            //     target: dom,
            //     lock: true,
            //     text: 'Loading',
            //     spinner: 'el-icon-loading',
            //     background: 'rgba(0, 0, 0, 0.7)'
            // });
            //this.HKLAmonitorcalc();
             this.timer = setInterval(this.HKLAmonitorcalc, 2000);
        },
        stopCalc: function () {
            clearInterval(this.timer);
        },
        change: function (Chart, option) {
            Chart.setOption(option);
        }
    }
};
</script>

<style scoped>
.input {
    width: 185px;
}
</style>>


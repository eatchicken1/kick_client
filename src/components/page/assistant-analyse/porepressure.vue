<template>
    <div>
        <el-col :span="5">
            <el-form label-width="140px">
                <span>地层孔隙压力预测分析参数设置</span>
                <el-divider></el-divider>
                <el-form-item label="开始计算时间">
                    <el-date-picker class="input" v-model="value1" type="datetime" placeholder="选择日期时间" align="right">

                    </el-date-picker>
                </el-form-item>
                <el-form-item label="Eaton指数">
                    <el-input class="input" v-model="EatonIndex"></el-input>
                </el-form-item>
                <el-form-item label="趋势线斜率">
                    <el-input class="input" v-model="a"></el-input>
                </el-form-item>
                <el-form-item label="趋势线截距">
                    <el-input class="input" v-model="b"></el-input>
                </el-form-item>
                <el-form-item label="正常孔隙压力梯度">
                    <el-input class="input" v-model="GN">
                        <template slot="append">g/cm3</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="上覆地层压梯">
                    <el-input class="input" v-model="GO">
                        <template slot="append">g/cm3</template>
                    </el-input>
                </el-form-item>

                <el-form-item label="">
                    <el-button @click="startCalc" type="primary">开始计算</el-button>
                    <el-button @click="stopCalc" type="primary">停止计算</el-button>
                </el-form-item>
                <!-- <span>分析结果</span>
                <el-divider></el-divider>
               
                <el-form-item label="地层孔隙压力">
                    <el-input class="input" v-model="porePressure" disabled="disabled">
                        <template slot="append">Mpa</template>
                    </el-input>
                </el-form-item> -->
            </el-form>
        </el-col>
        <el-col :span="12">
            <div id="porePressure" style="width: 1000px; height: 1200px; margin-left: 150px"></div>
        </el-col>
    </div>
</template>



<script>
//  api引入  参数传递与方法相同，不能乱设

import { porePressureApi } from '../../../api/index';
export default {
    name: 'porePressure',
    data() {
        return {
            porePressureChart: {},
            value1: '2021-11-22 15:00:10',
            EatonIndex: 1.2,
            a: 1600,
            b: 750,
            GO: 1.99,
            GN: 1.9,
            jh: '龙004-X1',
            timer: null,
            H: 5000,
            data: [],
            option: {
                grid: [],
                tooltip: {
                    axisPointer: {
                        axis: 'y',
                        type: 'cross',
                        label: {
                            show: true
                        }
                    },
                    trigger: 'axis',
                    formatter: function (params) {
                        var relVal = params[0].name;
                        var val = '井深:' + params[0].value[1] + '(m)';
                        for (var i = 0, l = params.length; i < l; i++) {
                            if (params[i].value) {
                                relVal += '<br/> ' + params[i].marker + params[i].seriesName + ' : ' + params[i].value[0];
                            }
                        }
                        relVal = val + relVal;
                        return relVal;
                    }
                },
                toolbox: {
                    top: '5%',
                    right: '1%',
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
                dataZoom: [
                    {
                        type: 'slider',
                        show: true,
                        yAxisIndex: [0, 1, 2, 3, 4, 5],
                        start: 65,
                        end: 100,
                        width: 20,
                        right: '0%'
                    },
                    {
                        type: 'inside',
                        yAxisIndex: [0, 1, 2, 3, 4, 5],
                        start: 65,
                        end: 100
                    }
                ],
                xAxis: [],
                yAxis: [],
                series: []
            },
            loadding: null,
        };
    },
    mounted() {
        var xAxisList = ['钻压(kN)', '转速(r/min)', '钻时(min/m)', '钻井液密度(g/cm3)', 'dc指数(g/cm3)', '地层孔隙压力系数(g/cm3)'];
        for (var i = 0; i < xAxisList.length; i++) {
            this.option.xAxis[i] = {
                type: 'value',
                gridIndex: i,
                position: 'top',
                name: xAxisList[i],
                nameLocation: 'middle',
                nameGap: 5,
                nameTextStyle: {
                    fontSize: 13
                },
                axisLabel: { show: false }
            };
            this.option.yAxis[i] = {
                type: 'value',
                gridIndex: i,
                inverse: true,
                scale: true,
                nameLocation: 'middle',
                nameGap: 30,
                axisLabel: { show: false },
                axisTick: { show: false },
                minorSplitLine: {
                    show: true
                },
                minorTick: {
                    show: true
                },
                nameTextStyle: {
                    fontSize: 15
                }
            };
            this.option.grid[i] = {
                x: ((100 - 8) / xAxisList.length) * i + 7 + '%',
                y: '5%',
                width: (100 - 8) / xAxisList.length + '%',
                height: '92%'
            };
            this.option.series[i] = {
                name: xAxisList[i],
                type: 'line',
                symbol: 'none',
                xAxisIndex: i,
                yAxisIndex: i,
                data: []
            };
        }
        this.option.yAxis[0].name = '井深(m)';
        this.option.yAxis[0].axisLabel.show = true;
        //设置坐标轴刻度
        this.option.xAxis[0].min = 0;
        this.option.xAxis[0].max = 200;
        this.option.xAxis[1].min = 0;
        this.option.xAxis[1].max = 200;
        this.option.xAxis[2].min = 0;
        this.option.xAxis[2].max = 60;
        this.option.xAxis[3].min = 0;
        this.option.xAxis[3].max = 3;
        this.option.xAxis[4].min = 0;
        this.option.xAxis[4].max = 3;
        this.option.xAxis[5].min = 0;
        this.option.xAxis[5].max = 3;
        for (var i = 0; i < xAxisList.length; i++) {
            this.option.xAxis[i].name += '\n' + '(' + this.option.xAxis[i].min + '—' + this.option.xAxis[i].max + ')';
        }
        this.porePressureChart = this.$echarts.init(document.getElementById('porePressure'));
        this.change(this.porePressureChart, this.option);
    },

    methods: {
        porePressureCalc() {
            porePressureApi({
                jh: this.$store.state.jh,
                startTime: this.value1,
                GN: this.GN,
                a: this.a,
                b: this.b,
                n: this.EatonIndex,
                H: this.H,
                GO: this.GO,
                //auth: this.$store.state.token
            })
                .then((res) => {
                    console.log(res)
                    if (res.isSuccess) {
                        if (res.content.activetyStatus.search('钻进') && res.content.wob != 0) {
                            this.value1 = res.content.startTime;
                            this.option.series[0].data.push([res.content.wob, res.content.depth]);
                            this.option.series[1].data.push([res.content.rpm, res.content.depth]);
                            this.option.series[2].data.push([res.content.rop, res.content.depth]);
                            this.option.series[3].data.push([res.content.mida, res.content.depth]);
                            this.option.series[4].data.push([res.content.dc, res.content.depth]);
                            this.option.series[5].data.push([res.content.pp, res.content.depth]);
                        } else {
                            this.value1 = res.content.startTime;
                        }
                        this.change(this.porePressureChart, this.option);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        startCalc: function () {
            
            //this.porePressureCalc();
             this.timer = setInterval(this.porePressureCalc, 2000);
        },
        stopCalc: function () {
            clearInterval(this.timer);
            this.timer = null;
        },
        change: function (Chart, option) {
            Chart.setOption(option);
        }
    }
};
</script>

<style scoped>
.input {
    width: 250px;
}
</style>
<template>
    <div>
        <span>实际摩阻系数起下钻井口载荷实时计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="120px">
                    <el-form-item label="钻头深度">
                        <el-input class="input" v-model="BitDepth">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <!-- <el-form-item label="井底扭矩">
                        <el-input class="input" v-model="BitTorque">
                            <template slot="append">kN·m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井底钻压">
                        <el-input class="input" v-model="BitWOB">
                            <template slot="append">kN</template>
                        </el-input>
                    </el-form-item> -->
                    <el-form-item label="转盘转速">
                        <el-input class="input" v-model="RPM">
                            <template slot="append">r/min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="运行速度">
                        <el-input class="input" v-model="AxialSpeed">
                            <template slot="append">m/min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="泥浆密度">
                        <el-input class="input" v-model="InnerMudDensity">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="管内摩擦系数">
                        <el-input class="input" v-model="CaseFc">
                            <template slot="append"></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="管外摩擦系数">
                        <el-input class="input" v-model="HoleFc">
                            <template slot="append"></template>
                        </el-input>
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
                    <el-form-item label="对比时间">
                        <el-date-picker v-model="value1" type="datetime" class="input" align="right"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="realData" style="margin-left: 70px">实测对比</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="16">
                <div id="labachart" style="width: 1400px; height: 1200px"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { TripAnalysis1 } from '../../api/index';
import { TripData } from '../../api/index';
var option = {
    title: {
        text: '起下钻井口载荷分析摩阻系数敏感性分析',
        top: '4%',
        left: '30%'
    },
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
            //数据单位格式化
            var relVal = params[0].name; //x轴名称
            var val = '钻头井深:' + params[0].value[1] + '(m)';
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
                        '<td>钻头井深(m)</td>';
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
            type: 'inside',
            yAxisIndex: [0],
            start: 0,
            end: 100
        },
        {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100
        }
    ],
    legend: {
        bottom: '5%',
        left: '90%',
        textStyle: {
            fontSize: 13
        },
        orient: 'horizontal'
    },
    grid: {
        left: '5%',
        right: '11%',
        top: '8%',
        bottom: '4%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        position: 'bottom',
        boundaryGap: false,
        name: '大钩载荷(kN)',
        nameGap: 25,
        minorTick: {
            show: true
        },
        nameLocation: 'middle',
        nameTextStyle: {
            fontSize: 15
        },
        minorSplitLine: {
            show: true
        }
    },
    yAxis: {
        type: 'value',
        name: '钻头井深(m)',
        inverse: true,
        nameGap: 40,
        inverse: true,
        // minorTick: {
        //     show: true
        // },
        nameLocation: 'middle',
        nameTextStyle: {
            fontSize: 15
        },
        minorSplitLine: {
            show: true
        },
        //scale: 'ture'
    },
    series: [
        {
            name: '下钻',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
      
         {
            name: '无摩阻',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data:[]
         },
      
        {
            name: '起钻',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '实际起钻悬重',
            type: 'scatter',
            sommth: 'true',
            //symbol: 'scatter',
            data: []
        },
         {
            name: '实际下钻悬重',
            type: 'scatter',
            sommth: 'true',
            //symbol: 'scatter',
            data: []
        }
    ]
};

export default {
    data() {
        return {
            labachartChart: {},
            WellName: '龙004-X1',
            MoveCondition: '旋转钻进',
            BitDepth: 4000,
            BitTorque: 0,
            BitWOB: 0,
            RPM: 60,
            AxialSpeed: 5,
            InnerMudDensity: 1.8,
            CaseFc: 0.35,
            HoleFc: 0.35,
            IsViscousEffect: 'false',
            value1: '2021-12-10 02:50:13'
        };
    },
    methods: {
        calc1() {
            var row = [];
            for (var i = 0; i < 3; i++) {
                row[i] = {
                    WellName: this.$store.state.jh,
                    MoveCondition: '下钻',
                    BitDepth: parseFloat(this.BitDepth),
                    WellDepth: parseFloat(this.BitDepth),
                    BitTorque: parseFloat(this.BitTorque),
                    BitWOB: parseFloat(this.BitWOB),
                    RPM: parseFloat(this.RPM),
                    AxialSpeed: parseFloat(this.AxialSpeed),
                    InnerMudDensity: parseFloat(this.InnerMudDensity),
                    OuterMudDensity: parseFloat(this.InnerMudDensity),
                    CaseFc: this.CaseFc,
                    HoleFc: this.HoleFc,
                    IsViscousEffect: false
                };
                if (i == 1) {
                    row[i] = {
                        WellName: this.$store.state.jh,
                        MoveCondition: '起钻',
                        BitDepth: parseFloat(this.BitDepth),
                        WellDepth: parseFloat(this.BitDepth),
                        BitTorque: parseFloat(this.BitTorque),
                        BitWOB: parseFloat(this.BitWOB),
                        RPM: parseFloat(this.RPM),
                        AxialSpeed: parseFloat(this.AxialSpeed),
                        InnerMudDensity: parseFloat(this.InnerMudDensity),
                        OuterMudDensity: parseFloat(this.InnerMudDensity),
                        CaseFc: 0,
                        HoleFc: 0,
                        IsViscousEffect: false
                    };
                }
                if (i > 1) {
                    row[i] = {
                        WellName: this.$store.state.jh,
                        MoveCondition: '起钻',
                        BitDepth: parseFloat(this.BitDepth),
                        WellDepth: parseFloat(this.BitDepth),
                        BitTorque: parseFloat(this.BitTorque),
                        BitWOB: parseFloat(this.BitWOB),
                        RPM: parseFloat(this.RPM),
                        AxialSpeed: parseFloat(this.AxialSpeed),
                        InnerMudDensity: parseFloat(this.InnerMudDensity),
                        OuterMudDensity: parseFloat(this.InnerMudDensity),
                        CaseFc:  parseFloat(this.CaseFc),
                    HoleFc: parseFloat(this.HoleFc),
                        IsViscousEffect: false
                    };
                }
            }
            for (let i = 0; i < row.length; i++) {
                TripAnalysis1(row[i])
                    .then((res) => {
                        var dataList = [];
                        var result = [];
                        for (var k = 0; k < res.content.length; k++) {
                            dataList.push([res.content[k].axialLoad, parseFloat(this.BitDepth) - k * 20]);
                        }
                        result[i] = dataList;
                        option.series[i].data = result[i];
                        this.labachartChart.setOption(option);
                    })
                    .catch((e) => {
                        console.log(e);
                        this.$message.error('请求失败');
                    });
            }
            console.log(row)
        },
        realData() {
            console.log('this.$store.state', this.$store.state);

            // var data = {
            //     StartTime:this.value1,
            //     jh: this.$store.state.jh
            // }
            // console.log("data",data)
            TripData({
                StartTime: this.value1,
                jh: this.$store.state.jh
                //jh:this.$store.state.jh,
            })
                .then((res) => {
                    console.log(res);
                    var dataList = [];
                    var dataList2 = [];
                    var result = [];
                    var result2 = [];
                    for (var k = 0; k < res.content.length; k++) {
                        dataList.push([res.content[k].hkla, res.content[k].depth]);
                         dataList2.push([res.content[k].hklA1, res.content[k].depth]);
                    }
                    result = dataList;
                      result2 = dataList2;
                    option.series[3].data = result;
                     option.series[4].data = result2;
                    this.labachartChart.setOption(option);
                     console.log(res)
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        change: function (Chart, option) {
            Chart.setOption(option);
        },
        radioChange(val) {
            this.IsViscousEffect = val;
        }
       
    },
    mounted() {
        this.labachartChart = this.$echarts.init(document.getElementById('labachart'), 'dark');

        this.change(this.labachartChart, option);
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
</style>
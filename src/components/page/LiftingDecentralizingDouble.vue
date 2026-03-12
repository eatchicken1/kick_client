<template>
    <div>
        <el-row>
            <el-col :span="24">
               <el-form :inline="true" label-width="120px">
                    <el-form-item label="钻头深度">
                        <el-input class="input" v-model="BitDepth">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 70px">摩阻计算</el-button>
                    </el-form-item>
                    <el-form-item label="起下钻对比时间">
                        <el-date-picker v-model="value1" type="datetime" class="input" align="right"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="realData" style="margin-left: 70px">实测对比</el-button>
                    </el-form-item>
                     <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc12" style="margin-left: 70px">扭矩计算</el-button>
                    </el-form-item>
                     <el-form-item  label="扭矩对比时间">
                        <el-date-picker v-model="value2" type="datetime" class="input" align="right"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="realData2" style="margin-left: 70px">实测对比</el-button>
                    </el-form-item>
               </el-form>

              
               
                <!-- <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="calc2">实时数据</el-button> -->
            </el-col>
        </el-row>
        <el-row>        
            <el-col :span="12">
                <div id="labachart" style="width: 1100px; height: 900px"></div>
               
            </el-col>
             <el-col :span="12">
              
                <div id="AxialLoad" style="width: 1100px; height: 900px"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { TripAnalysis1 } from '../../api/index';
import { TorqueOffBottom1 } from '../../api/index';
import { RealData } from '../../api/index';
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
        nameGap: 10,
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
        nameGap: 20,
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
        }
        //scale: 'ture'
    },
    series: [
        {
            name: '下钻，0.50',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.45',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.40',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.35',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.30',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.25',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.20',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.15',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '下钻，0.10',
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
            data: []
        },
        {
            name: '起钻，0.10',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.15',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.20',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.25',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.30',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.35',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.40',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.45',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '起钻，0.50',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data: []
        },
        {
            name: '实际起钻悬重1',
            type: 'scatter',
            sommth: 'true',
            //symbol: 'scatter',
            data: []
        },
        {
            name: '实际下钻悬重1',
            type: 'scatter',
            sommth: 'true',
            //symbol: 'scatter',
            data: []
        }
    ]
};
var option2 = {
    title: {
        text: '钻柱空转地面扭矩摩阻系数敏感性分析',
        bottom: '1%',
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
       // data: ['0.35', '0.30', '0.25', '0.20', '0.15', '0.10','空转扭矩1','钻进实测1','空转扭矩2','钻进实测2','空转扭矩3','钻进实测3',],
        bottom: '40%',
        left: '85%',
        textStyle: {
            fontSize: 14
        },
        orient: 'horizontal'
    },
    grid: {
        left: '5%',
        top: '4%',
        right: '2%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        position: 'top',
        boundaryGap: false,
        name: '井口扭矩(kN·m)',
        nameGap: 10,
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
        name: '井深(m)',
        inverse: true,
        nameGap: 20,
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
    series: [
        {
            name: '0.35',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data:[]
          
        },
        {
            name: '0.30',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
            data:[]
           
        },
        {
            name: '0.25',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
              data:[]
          
        },
        {
            name: '0.20',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
              data:[]
           
        },
        {
            name: '0.15',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
              data:[]
          
        },
        {
            name: '0.10',
            type: 'line',
            sommth: 'true',
            symbol: 'none',
              data:[]
         
        },
         {
            name: '实测空转扭矩1',
            type: 'scatter',
            sommth: 'true',
            //symbol: 'scatter',
            data: []
        },
         {
            name: '实测钻进扭矩1',
            type: 'scatter',
            sommth: 'true',
            //symbol: 'scatter',
            data: []
        },
         
         
    ]
};

export default {
    data() {
        return {
             AxialLoadChart: {},
            labachartChart: {},
            WellName: '龙004-X1',
            MoveCondition: '旋转钻进',
            BitDepth: 4000,
            BitTorque: 0,
            BitWOB: 0,
            RPM: 60,
            AxialSpeed: 5,
            InnerMudDensity: 1.8,
            CaseFc: 0.2,
            HoleFc: 0.3,
            IsViscousEffect: 'false',
            value1: '2021-12-10 00:00:01',
             value2: '2021-12-10 00:00:01',
           
        };
    },
    methods: {
        calc1() {
            var row = [];
            for (var i = 0; i < 19; i++) {
                row[i] = {
                    WellName: this.$store.state.jh,
                    MoveCondition: '下钻',
                    BitDepth: parseFloat(this.BitDepth),
                    WellDepth: parseFloat(this.BitDepth),
                    BitTorque: 0,
                    BitWOB: 0,
                    RPM: 60,
                    AxialSpeed: 5,
                    InnerMudDensity: 1.8,
                    OuterMudDensity: 1.8,
                    CaseFc: 0.5 - i * 0.05,
                    HoleFc: 0.5 - i * 0.05,
                    IsViscousEffect: false
                };
                if (i == 9) {
                    row[i] = {
                        WellName: this.$store.state.jh,
                        MoveCondition: '起钻',
                        BitDepth: parseFloat(this.BitDepth),
                        WellDepth: parseFloat(this.BitDepth),
                        BitTorque: 0,
                        BitWOB: 0,
                        RPM: 6000,
                        AxialSpeed: 5,
                        InnerMudDensity: 1.8,
                        OuterMudDensity: 1.8,
                        CaseFc: 0,
                        HoleFc: 0,
                        IsViscousEffect: false
                    };
                }
                if (i > 9) {
                    row[i] = {
                        WellName: this.$store.state.jh,
                        MoveCondition: '起钻',
                        BitDepth: parseFloat(this.BitDepth),
                        WellDepth: parseFloat(this.BitDepth),
                        BitTorque: 0,
                        BitWOB: 0,
                        RPM: 6000,
                        AxialSpeed: 5,
                        InnerMudDensity: 1.8,
                        OuterMudDensity: 1.8,
                        CaseFc: 0.1 + (i - 10) * 0.05,
                        HoleFc: 0.1 + (i - 10) * 0.05,
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
        },
        realData() {
            console.log('this.$store.state', this.$store.state);

            // var data = {
            //     StartTime:this.value1,
            //     jh: this.$store.state.jh
            // }
            // console.log("data",data)
            RealData({
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
                    for (var k = 0; k < res.content[0].length; k++) {
                        dataList.push([res.content[0][k].hkla, res.content[0][k].depth]);
                    }
                    for (var k = 0; k < res.content[1].length; k++) {
                        dataList2.push([res.content[1][k].hkla, res.content[1][k].depth]);
                    }
                    result = dataList;
                    result2 = dataList2;
                    option.series[19].data = result;
                    option.series[20].data = result2;
                    this.labachartChart.setOption(option);
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
        },
        calc12() {
            var row = [];
            for (var i = 0; i < 6; i++) {
                row[i] = { 
                     WellName: this.$store.state.jh,
                    MoveCondition: '旋转钻进',
                    BitDepth: parseFloat(this.BitDepth),
                    WellDepth: parseFloat(this.BitDepth),
                    BitTorque: 0,
                    BitWOB: 0,
                    RPM: 60,
                    AxialSpeed: 5,
                    InnerMudDensity: 1.8,
                    OuterMudDensity: 1.8,
                    CaseFc: 0.35 - i * 0.05,
                    HoleFc: 0.35 - i * 0.05,
                    IsViscousEffect: false,
                    
                };
            }
            // for (let i = 0; i < row.length; i++) 
            for (let i = 0; i < row.length; i++) {
                TorqueOffBottom1(row[i])
                    .then((res) => {
                        var dataList = [];
                        var result = [];
                        for (var k = 0; k < res.content.length; k++) {
                            dataList.push([res.content[k].torque, this.BitDepth - k * 20]);
                        }
                        result[i] = dataList;
                        option2.series[i].data = result[i];
                        this.AxialLoadChart.setOption(option2);
                    })
                    .catch((e) => {
                        console.log(e);
                        this.$message.error('请求失败');
                    });
            }
        },
        change: function (Chart, option2) {
            Chart.setOption(option2);
        },
        radioChange(val) {
            this.IsViscousEffect = val;
        },
        realData2() {
            console.log('this.$store.state', this.$store.state);

            // var data = {
            //     StartTime:this.value1,
            //     jh: this.$store.state.jh
            // }
            // console.log("data",data)
            RealData({
                StartTime: this.value2,
                jh: this.$store.state.jh
                //jh:this.$store.state.jh,
            })
                .then((res) => {
                    console.log(res);
                    var dataList = [];
                    var dataList2 = [];
                    var result = [];
                     var result2 = [];
                    for (var k = 0; k < res.content[3].length; k++) {
                        dataList.push([res.content[3][k].torqa, res.content[3][k].depth]);
                      
                    }
                    for (var k = 0; k < res.content[2].length; k++) {
                        dataList2.push([res.content[2][k].torqa, res.content[2][k].depth]);
                      
                    }
                    result = dataList;
                     result2 = dataList2;
                    option2.series[6].data = result;
                     option2.series[7].data = result2;
                    this.AxialLoadChart.setOption(option2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        change: function (Chart, option2) {
            Chart.setOption(option2);
        },
        radioChange(val) {
            this.IsViscousEffect = val;
        },
    },
    mounted() {
        this.labachartChart = this.$echarts.init(document.getElementById('labachart'), 'dark');

        this.change(this.labachartChart, option);

         this.AxialLoadChart = this.$echarts.init(document.getElementById('AxialLoad'),'dark');
      
        this.change(this.AxialLoadChart, option2);
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
</style>
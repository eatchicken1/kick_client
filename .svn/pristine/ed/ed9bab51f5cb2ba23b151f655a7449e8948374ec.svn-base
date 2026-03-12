<template>
    <div>
        <span>钻柱与井壁间摩擦系数计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="120px">
                    <el-form-item label="井眼深度">
                        <el-input class="input" v-model="BitDepth">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="泥浆密度">
                        <el-input class="input" v-model="InnerMudDensity">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="套管鞋钩载">
                        <el-input class="input" v-model="CasingShoeF">
                            <template slot="append">kN</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井底钩载">
                        <el-input class="input" v-model="BottomF">
                            <template slot="append">kN</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="套管段摩擦系数">
                        <el-input class="input" v-model="result1">
                            <template slot="append"></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="裸眼段摩擦系数">
                        <el-input class="input" v-model="result2">
                            <template slot="append"></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 70px">计算</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="16">
                <div id="FcCalc" style="width: 1000px; height: 900px"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { HoleFcCalc1 } from '../../../api/index';
export default {
    data() {
        return {
            FcCalcChart: {},
            WellName: '龙004-X1',
            BitDepth: 5000,
            InnerMudDensity: 1.85,
            CasingShoeF: 1504,
            BottomF: 1550,
            result1: 0,
            result2: 0,
            datalist: [],
            option: {
                title: {
                    text: '钻柱与井壁摩擦系数沿井深分布',
                    bottom: '3%',
                    left: '40%'
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
                        var relVal = params[0].name;
                        var val = "井深:" + params[0].value[1] + "(m)";
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
                    itemSize: 20,
                    itemGap: 15,
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: false,
                            optionToContent: function (opt) {
                                var series = opt.series;
                                var table =
                                    '<table border:1px solid #ccc; style="width:100%;user-select:text;text-align:center"><tbody><tr>'
                                    + '<td>井深(m)</td>'
                                for (var i = 0; i < series.length; i++) {
                                    table += '<td>' + series[i].name + '</td>';
                                }
                                table += '</tr>';
                                for (var i = 0, l = series[0].data.length; i < l; i++) {
                                    table += '<tr>'
                                        + '<td>' + series[0].data[i][1] + '</td>';
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
                    bottom: '85%',
                    left: '75%',
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
                    max: 1,
                    min: 0,
                    name: '钻柱与井壁摩擦系数',
                    nameGap: 25,
                    nameLocation: 'middle',
                    nameTextStyle: {
                        fontSize: 15
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '井深m',
                    inverse: true,
                    nameGap: 30,
                    inverse: true,
                    nameLocation: 'middle',
                    nameTextStyle: {
                        fontSize: 15
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    }
                },
                series: [
                    {
                        name: '钻柱摩擦系数',
                        type: 'line',
                        symbol: 'none',
                        data: []
                    }
                ]
            }
        };
    },
    methods: {
        calc1() {
            var row = null;
            row = {
                WellName: this.$store.state.jh,
                BitDepth: parseFloat(this.BitDepth),
                CasingShoeF: parseFloat(this.CasingShoeF),
                BottomF: parseFloat(this.BottomF),
                InnerMudDensity: parseFloat(this.InnerMudDensity),
                OuterMudDensity: parseFloat(this.InnerMudDensity),
                auth: this.$store.state.token
            };
            HoleFcCalc1(row)
                .then((res) => {
                    if (res.content == null) {
                        this.$message.error(res.message)
                    } else {
                        this.result1 = res.content.casingFc;
                        this.result2 = res.content.holeFc;

                        for (var i = 0; i < res.content.casingShoeDep; i++) {
                            this.datalist.push([res.content.casingFc, i]);

                        }
                        for (var k = res.content.casingShoeDep; k < res.content.wellDepth; k++) {
                            this.datalist.push([res.content.holeFc, k]);
                        }
                        this.option.series[0].data = this.datalist;
                        this.change(this.FcCalcChart, this.option);
                    }

                })
        },
        change(Chart, option) {
            Chart.setOption(option);
        }
    },
    mounted() {
        this.FcCalcChart = this.$echarts.init(document.getElementById('FcCalc'));
        this.change(this.FcCalcChart, this.option);
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
</style>
<template>
    <div id="test" style="width:100%;height:325px;"></div>
</template>

<script>
const options = {
    tooltip: {
        formatter: '{a} <br/>{c} {b}'
    },
    series: [
        {
            name: '钻压',
            type: 'gauge',
            center: ['80%', '55%'], // 默认全局居中
            min: 0,
            max: 200,
            endAngle: -45,
            radius: '60%',
            splitNumber: 5,
            axisLine: {
                // 坐标轴线
                lineStyle: {
                    // 属性lineStyle控制线条样式
                    width: 8
                }
            },
            axisTick: {
                // 坐标轴小标记
                length: 12, // 属性length控制线长
                lineStyle: {
                    // 属性lineStyle控制线条样式
                    color: 'auto'
                }
            },
            splitLine: {
                // 分隔线
                length: 20, // 属性length控制线长
                lineStyle: {
                    // 属性lineStyle（详见lineStyle）控制线条样式
                    color: 'auto'
                }
            },
            pointer: {
                width: 5
            },
            title: {
                offsetCenter: [0, '-30%'] // x, y，单位px
            },
            detail: {
                // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                fontWeight: 'bolder'
            },
            data: []
        },

        {
            name: '转速',
            type: 'gauge',
            center: ['20%', '55%'], // 默认全局居中
            radius: '60%',
            min: 0,
            max: 200,
            endAngle: -45,
            splitNumber: 5,
            axisLine: {
                // 坐标轴线
                lineStyle: {
                    // 属性lineStyle控制线条样式
                    width: 8,
                    color:[[0.1, '#c23531'], [0.8, '#63869e'], [1,'#91c7ae'] ]
                }
            },
            axisTick: {
                // 坐标轴小标记
                length: 12, // 属性length控制线长
                lineStyle: {
                    // 属性lineStyle控制线条样式
                    color: 'auto'
                }
            },
            splitLine: {
                // 分隔线
                length: 20, // 属性length控制线长
                lineStyle: {
                    // 属性lineStyle（详见lineStyle）控制线条样式
                    color:'auto'
                    
                }
            },
            pointer: {
                width: 5
            },
            title: {
                offsetCenter: [0, '-30%'] // x, y，单位px
            },
            detail: {
                // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                fontWeight: 'bolder'
            },
            data: []
        },
        {
            name: '机械转速',
            type: 'gauge',
            center: ['50%', '50%'],
            min: 0,
            max: 20,
            splitNumber: 5,
            radius: '80%',
            axisLine: {
                // 坐标轴线
                lineStyle: {
                    // 属性lineStyle控制线条样式
                    width: 10,
                    color:[[0.2, '#91c7ae'], [0.8, '#63869e'], [1, '#c23531']]
                }
            },
            axisTick: {
                // 坐标轴小标记
                length: 15, // 属性length控制线长
                lineStyle: {
                    // 属性lineStyle控制线条样式
                    color: 'auto'
                }
            },
            splitLine: {
                // 分隔线
                length: 20, // 属性length控制线长
                lineStyle: {
                    // 属性lineStyle（详见lineStyle）控制线条样式
                    color: 'auto'
                }
            },
            axisLabel: {
                backgroundColor: 'auto',
                borderRadius: 2,
                color: '#eee',
                padding: 3,
                textShadowBlur: 2,
                textShadowOffsetX: 1,
                textShadowOffsetY: 1,
                textShadowColor: '#222'
            },
            title: {
                // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                fontWeight: 'bolder',
                fontSize: 20,
                fontStyle: 'italic'
            },
            detail: {
                // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                formatter: function (value) {
                    value = (value + '').split('.');
                    value.length < 2 && value.push('00');
                    return ('00' + value[0]).slice(-2) + '.' + (value[1] + '00').slice(0, 2);
                },
                fontWeight: 'bolder',
                borderRadius: 3,
                backgroundColor: '#444',
                borderColor: '#aaa',
                shadowBlur: 5,
                shadowColor: '#333',
                shadowOffsetX: 0,
                shadowOffsetY: 3,
                borderWidth: 2,
                textBorderColor: '#000',
                textBorderWidth: 2,
                textShadowBlur: 2,
                textShadowColor: '#fff',
                textShadowOffsetX: 0,
                textShadowOffsetY: 0,
                fontFamily: 'Arial',
                width: 100,
                color: '#eee',
                rich: {}
            },
            data: []
        }
    ]
};
export default {
    name: 'OptimParameter',
    props: {
        BestDrillParameter: Array,
        WOB:Array,
        RPM:Array,
        ROP:Array,
    },
    watch: {
        BestDrillParameter: {
            handler: function (val, oldVal) {
                this.change(this.chart, val);
            }
        }
    },
    mounted() {
        this.chart = this.$echarts.init(document.getElementById('test'));
        this.change(this.chart, this.BestDrillParameter);
        this.temp = setInterval(() => {
            //options.series[0].data[0].value=this.$store.state.city;
            options.series[0].data[0].value = (this.WOB[this.WOB.length-1]+Math.random()*10).toFixed(0) - 0;
            options.series[1].data[0].value = (this.RPM[this.RPM.length-1]+Math.random()*20).toFixed(0) - 0;
            options.series[2].data[0].value = (60/this.ROP[this.ROP.length-1]+Math.random()*1).toFixed(0) - 0;
            this.chart.setOption(options);
        }, 20000);
    },
    destroyed() {
        clearInterval(this.temp);
    },
    methods: {
        change: function (chart, value) {
            options.series[0].data = [{ value: value[0], name: '推荐钻压KN' }];
            options.series[1].data = [{ value: value[1], name: '推荐转速r/min' }];
            options.series[2].data = [{ value: value[2], name: '目标钻速km/h' }];
            chart.setOption(options);
        },
        wobChange:function(){
            
        }
    },
    data() {
        return {
            chart: {},
            temp: 222
        };
    }
};
</script>

<style lang="stylus" scoped>
.schart5 {
  width: 100%;
  height: 650px;
}
</style>
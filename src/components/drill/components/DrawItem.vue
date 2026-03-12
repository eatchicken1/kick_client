<template>
    <div>
        <div id="all" style="width: 100%; height: 650px;"></div>
    </div>
</template>

<script>
const option = {
    grid: [
        { x: '5%', y: '2%', width: '92%', height: '20%' },
        { x: '5%', y: '27%', width: '92%', height: '20%' },
        { x: '5%', y: '52%', width: '92%', height: '20%' },
        { x: '5%', y: '77%', width: '92%', height: '20%' }
    ],
    tooltip: {
        formatter: 'Group {a}: ({c})',
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    xAxis: [{ gridIndex: 0 }, { gridIndex: 1 }, { gridIndex: 2 }, { gridIndex: 3 }],
    yAxis: [
        {
            gridIndex: 0,
            name: '钻压',
            nameLocation: 'middle',
            nameGap: 10,
            scale: true,
            splitNumber: 2,
            nameTextStyle: {
                fontSize: 15
            },
            axisLabel: {
                inside: true
            },
            axisTick: {
                inside: true
            }
        },
        {
            gridIndex: 1,
            name: '转速',
            nameLocation: 'middle',
            nameGap: 10,
            scale: true,
            splitNumber: 2,
            nameTextStyle: {
                fontSize: 15
            },
            axisLabel: {
                inside: true
            },
            axisTick: {
                inside: true
            }
        },
        {
            gridIndex: 2,
            name: '扭矩',
            nameLocation: 'middle',
            nameGap: 10,
            scale: true,
            splitNumber: 2,
            nameTextStyle: {
                fontSize: 15
            },
            axisLabel: {
                inside: true
            },
            axisTick: {
                inside: true
            }
        },
        {
            gridIndex: 3,
            name: '钻时',
            nameLocation: 'middle',
            nameGap: 10,
            scale: true,
            splitNumber: 2,
            nameTextStyle: {
                fontSize: 15
            },
            axisLabel: {
                inside: true
            },
            axisTick: {
                inside: true
            }
        }
    ],
    series: [
        {
            name: 'I',
            type: 'line',
            symbol: 'circle',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: []
        },
        {
            name: 'II',
            type: 'line',
            symbol: 'circle',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: []
        },
        {
            name: 'III',
            type: 'line',
            symbol: 'circle',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: []
        },
        {
            name: 'IV',
            type: 'line',
            symbol: 'circle',
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: []
        }
    ]
};
export default {
    name: 'DrawItem',
    props: {
        realtimeData: Array
    },
    data() {
        return {
            allchart: {}
        };
    },
    watch: {
        realtimeData: {
            handler: function (val, oldVal) {
                this.change(this.allchart, val);
            }
        }
    },
    mounted() {
        this.allchart = this.$echarts.init(document.getElementById('all'));
        this.change(this.allchart, this.realtimeData);
    },
    methods: {
        change: function (allchart, realtimeData) {
            option.series[0].data = this.realtimeData[0];
            option.series[1].data = this.realtimeData[1];
            option.series[2].data = this.realtimeData[2];
            option.series[3].data = this.realtimeData[3];
            allchart.setOption(option);
        }
    }
};
</script>

<style lang="stylus" scoped></style>
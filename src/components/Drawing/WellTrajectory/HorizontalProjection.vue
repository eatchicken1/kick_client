<template>
    <div id="horizontalProjection" style="height: 400px; width: 400px"></div>
</template>
<script>
import { getHorizontalData } from '../../../api/index';
export default {
    name: 'HorizontalProjection',
    data() {
        return {
            myChart: {},
            option: {},
            divDom: {}
        };
    },
    mounted() {
        this.drawHorizontalProjection();
        this.listenContainer();
    },
    methods: {
        listenContainer() {
            let that = this;
            let resizeTimer = null;
            this.$erd.listenTo(document.querySelector('.box-card-horizontal'), function (element) {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(function () {
                    let width = element.offsetWidth;
                    let height = element.offsetHeight;
                    console.log(height, width);
                    let dom = document.getElementById('horizontalProjection');
                    console.log(dom);
                    dom.style.height = height - 60 + 'px';
                    dom.style.width = width - 20 + 'px';
                    that.myChart.resize();
                }, 100);
            });
        },
        drawHorizontalProjection() {
            this.myChart = this.$echarts.init(document.getElementById('horizontalProjection'));
            // 数据请求
            getHorizontalData().then((res) => {
                this.option = {
                    animation: false,
                    grid: {
                        top: 40,
                        left: 50,
                        right: 40,
                        bottom: 50
                    },
                    xAxis: {
                        name: 'X',
                        minorTick: {
                            show: true
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        minorSplitLine: {
                            show: true,
                            lineStyle: {
                                color: '#ddd'
                            }
                        },
                        min: -800,
                        max: 700
                    },
                    yAxis: {
                        name: 'Y',
                        minorTick: {
                            show: true
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        minorSplitLine: {
                            show: true,
                            lineStyle: {
                                color: '#ddd'
                            }
                        }
                    },
                    // dataZoom: [
                    //     {
                    //         show: true,
                    //         type: 'inside',
                    //         filterMode: 'none'
                    //     },
                    //     {
                    //         show: true,
                    //         type: 'inside',
                    //         filterMode: 'none'
                    //     }
                    // ],
                    series: [
                        {
                            name: '实钻轨迹',
                            type: 'line',
                            showSymbol: false,
                            clip: true,
                            data: res
                        }
                    ]
                };
                this.myChart.setOption(this.option);
            });
        }
    }
};
</script>
<style >
</style>
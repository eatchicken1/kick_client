<template>
<div id="verticalProjection" style="height: 400px; width: 400px"></div>
</template>
<script>
import { getVerticalData } from '../../../api/index';
export default {
    name: 'VerticalProjection',
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
            this.$erd.listenTo(document.querySelector('.box-card-vertical'), function (element) {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(function () {
                    let width = element.offsetWidth;
                    let height = element.offsetHeight;
                    console.log(height,width);
                    let dom = document.getElementById('verticalProjection');
                    console.log(dom);
                    dom.style.height = height - 60 + "px";
                    dom.style.width = width - 20 + "px";
                    that.myChart.resize();
                }, 100);
            });
        },
        drawHorizontalProjection() {
            this.myChart = this.$echarts.init(document.getElementById('verticalProjection'));
            // 数据请求
            getVerticalData().then((res) => {
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
                        min:-2000,
                        max:3000,
                        // inverse: true,
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
                    yAxis: {
                        name: 'Y',
                        max:5000,
                        inverse:true,
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
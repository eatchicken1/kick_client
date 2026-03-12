<template>
    <div id="trajectory3D" style="height: 400px; width: 400px"></div>
</template>
<script>
import { getThreeData } from '../../../api/index';
export default {
    name: 'TrajectoryFor3D',
    props: {
        width: {
            type: Number,
            default: 300
        },
        height: {
            type: Number,
            default: 300
        }
    },
    data() {
        return {
            myChart: {},
            option: {},
            divDom: {}
        };
    },
    mounted() {
        this.setDivHeightAndWidth(this.style.height, this.style.width);
        this.drawTrajectoryFor3D();
    },
    methods: {
        // 设置绘画区域的宽，高
        setDivHeightAndWidth(height, width) {
            this.divDom = document.getElementById('trajectory3D');
            this.divDom.style.height = height;
            this.divDom.style.width = width;
        },
        drawTrajectoryFor3D() {
            this.myChart = this.$echarts.init(this.divDom);
            // 数据请求
            getThreeData().then((res) => {
                this.option = {
                    tooltip: {},
                    backgroundColor: '#fff',
                    xAxis3D: {
                        type: 'value',
                        min: -2000
                    },
                    yAxis3D: {
                        type: 'value',
                        min: 0,
                        max: 2000
                    },
                    zAxis3D: {
                        type: 'value',
                        inverse: true
                    },
                    grid3D: {
                        viewControl: {
                            projection: 'orthographic'
                        },
                        boxHeight: -100
                    },
                    series: [
                        {
                            type: 'line3D',
                            data: res,
                            lineStyle: {
                                width: 4
                            }
                        },
                    ]
                };
                this.myChart.setOption(this.option);
            });
        }
    },
    computed: {
        style() {
            const obj = {};
            console.log('computed', this.height, this.width);
            if (this.width != 0 && this.height != 0)
                obj.height = obj.width = this.height - 80 >= this.width ? this.width + 'px' : this.height - 80 + 'px';
            return obj;
        }
    },
    watch: {
        style(value, old) {
            this.setDivHeightAndWidth(value.height, value.width);
            console.log(value);
            this.myChart.resize();
        }
    }
};
</script>
<style>
</style>
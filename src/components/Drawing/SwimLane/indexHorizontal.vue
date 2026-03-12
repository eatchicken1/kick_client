<template>
    <el-card>
        <div id="swimLane" style="height: 750px; width: 1200px"></div>
    </el-card>
</template>
<script>
import X from "echarts-better"
export default {
    data() {
        return {
            mychart: null,
            mockData: {
                title: '地层空隙压力预测',
                subTitle: '龙004-X1',
                data: [
                    {
                        name: '牙轮可钻性',
                        lineColor: 'black',
                        min: 0,
                        max: 10,
                        groupId: 0,
                        data: [
                            [8.0, 6.58],
                            [8.0, 5.76],
                            [8.0, 7.71],
                            [8.0, 8.84],
                            [8.0, 8.47],
                            [8.0, 7.04],
                            [8.0, 5.25],
                            [19.0, 12.5],
                            [8.0, 5.56],
                            [8.0, 7.91],
                            [8.0, 6.89]
                        ]
                    },
                    {
                        name: 'PDC可钻性',
                        lineColor: 'red',
                        min: 0,
                        max: 10,
                        groupId: 0,
                        data: [
                            // [10.0, 7.46],
                            // [8.0, 6.77],
                            // [13.0, 12.74],
                            // [9.0, 7.11],
                            // [11.0, 7.81],
                            // [14.0, 8.84],
                            // [6.0, 6.08],
                            // [4.0, 5.39],
                            // [12.0, 8.15],
                            // [7.0, 6.42],
                            // [5.0, 5.73]
                        ]
                    },
                    {
                        name: '抗压强度',
                        lineColor: 'balck',
                        min: 0,
                        max: 200,
                        groupId: 1,
                        data: [
                            // [10.0, 7.46],
                            // [8.0, 6.77],
                            // [13.0, 12.74],
                            // [9.0, 7.11],
                            // [11.0, 7.81],
                            // [14.0, 8.84],
                            // [6.0, 6.08],
                            // [4.0, 5.39],
                            // [12.0, 8.15],
                            // [7.0, 6.42],
                            // [5.0, 5.73]
                        ]
                    },
                    {
                        name: '机械比能',
                        lineColor: 'balck',
                        min: 0,
                        max: 200,
                        groupId: 1,
                        data: []
                    },
                    {
                        name: 'DC指数',
                        lineColor: 'balck',
                        min: 0,
                        max: 2,
                        groupId: 2,
                        data: []
                    },
                    {
                        name: 'Sigma()',
                        lineColor: 'balck',
                        min: 0,
                        max: 2,
                        groupId: 2,
                        data: []
                    },
                    {
                        name: '孔隙压力-DC指数()',
                        lineColor: 'balck',
                        min: 0,
                        max: 2,
                        groupId: 3,
                        data: []
                    },
                    {
                        name: '孔隙压力-Sigma()',
                        lineColor: 'balck',
                        min: 0,
                        max: 2,
                        groupId: 3,
                        data: []
                    },
                    {
                        name: '破裂压力-DC指数()',
                        lineColor: 'balck',
                        min: 0,
                        max: 20,
                        groupId: 4,
                        data: [
                            [8.0, 6.58],
                            [8.0, 5.76],
                            [8.0, 7.71],
                            [8.0, 8.84],
                            [8.0, 8.47],
                            [8.0, 7.04],
                            [8.0, 5.25],
                            [19.0, 12.5],
                            [8.0, 5.56],
                            [8.0, 7.91],
                            [8.0, 6.89]
                        ]
                    }
                ]
            }
        };
    },
    mounted() {
        const dom = document.getElementById('swimLane');
        this.myChart = X.init(dom);
        console.log(this.getDataMap(this.mockData.data));
        console.log(this.myChart);
        this.draw(this.getDataMap(this.mockData.data), this.myChart);
    },

    methods: {
        draw(data, myChart) {
            let count = 0;
            let option = {
                grid: [],
                xAxis: [],
                yAxis: [],
                series: [],
                graphic: [],
                legend: [],
                dataZoom: []
            };
            const len = data.size;
            let percent = 90 / len;
            console.log(len);
            for (let [key, value] of data.entries()) {
                let temp = percent * key + 5;
                let left = temp.toFixed(2) + '%';
                let legendLeft = (temp + percent * 0.2).toFixed(2) + '%';
                console.log(legendLeft);
                let width = percent.toFixed(2) + '%';
                option.grid[key] = {
                    top: left,
                    height: width,
                    left: 120
                };
                // 每一格的高度
                let len = value.length;
                if (len == 0) continue;
                let height = 120 / len;
                let halfHeight = height / 2;
                value.forEach((item, index) => {
                    let offset = index * height;
                    let top = halfHeight + offset - 10;
                    option.legend[count] = {
                        x: top,
                        y: legendLeft,
                        rotation: 90,
                        data: [item.name]
                    };
                    //  option.legend[count] = {
                    //     x: top,
                    //     y: legendLeft,
                    //     data: [item.name],
                    //     formatter: name => {
                    //         let ret = "";
                    //         for (let item of name) {
                    //             ret = ret + "\n" + item;
                    //         }
                    //         return ret;
                    //     }
                    // };
                    option.yAxis[count] = {
                        min: item.min,
                        max: item.max,
                        gridIndex: key,
                        position: 'left',
                        offset: offset,
                        axisLabel: {
                            formatter: (value, index) => {
                                if (value == item.min) {
                                    return '{a|' + value + '}';
                                }
                                if (value == item.max) {
                                    return '{b|' + value + '}';
                                }
                                return '{b|' + '' + '}';
                            },
                            rich: {
                                a: {
                                    align: 'right',
                                    padding: [20, 0, 0, 0]
                                },
                                b: {
                                    align: 'right',
                                    padding: [-20, 0, 0, 0]
                                }
                            }
                        },
                        axisLine: {
                            onZero: false
                        }
                    };
                    option.xAxis[count] = {
                        gridIndex: key,
                        axisLabel: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    };
                    option.series[count] = {
                        name: item.name,
                        xAxisIndex: count,
                        yAxisIndex: count,
                        type: 'line',
                        data: item.data.map((value) => [value[1], value[0]])
                    };
                    count++;
                });
            }
            console.log(option);
            myChart.setOption(option);

            const initedOption = myChart.getOption();
            const xAxis = initedOption.xAxis;
            const yAxis = initedOption.yAxis;
            yAxis.forEach((value, index) => {
                console.log(value, index);
                let zeroPx = myChart.convertToPixel({ gridIndex: value.gridIndex }, [0, 0]);
                let maxPx = myChart.convertToPixel({ gridIndex: value.gridIndex }, [0, value.max]);
                option.graphic[value.gridIndex] = {
                    type: 'rect',
                    id: index,
                    shape: {
                        x: zeroPx[0],
                        y: zeroPx[1],
                        height: maxPx[1] - zeroPx[1],
                        width: -120
                    },
                    style: {
                        fill: '#dcdde1',
                        stroke: '#333',
                        lineWidth: 1
                    }
                };
            });
            option.dataZoom.push({
                type: 'slider',
                show: true,
                xAxisIndex: xAxis.map((value, index) => index),
                top: '5%',
                height: 15,
                zoomLock: true
            });
            option.xAxis[xAxis.length - 1] = {
                axisLabel: {
                    show: true
                },
                axisTick: {
                    show: true
                }
            };
            myChart.setOption(option);
            console.log(myChart.getOption());
        },
        // 将数据分组
        getDataMap(data) {
            const map = new Map();
            data.forEach((item) => {
                if (map.has(item.groupId)) {
                    map.get(item.groupId).push(item);
                } else {
                    map.set(item.groupId, [item]);
                }
            });
            return map;
        }
    }
};
</script>

<style>
</style>
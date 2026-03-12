<template>
    <div id="swimLane"></div>
</template>
<script>
String.prototype.pxWidth = function (font) {
    // re-use canvas object for better performance
    var canvas = String.prototype.pxWidth.canvas || (String.prototype.pxWidth.canvas = document.createElement('canvas')),
        context = canvas.getContext('2d');

    font && (context.font = font);
    var metrics = context.measureText(this);

    return metrics.width;
};
export default {
    props: {
        tableHead: {
            type: Array
        },
        data: {
            type: Map
        },
        echartWidth: {
            type: Number,
            default: 1200
        },
        echartHeight: {
            type: Number,
            default: 750
        }
    },
    data() {
        return {
            myChart: null,
            echartBottom: 20,
            mockData: {
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
                            [10.0, 7.46],
                            [8.0, 6.77],
                            [13.0, 12.74],
                            [9.0, 7.11],
                            [11.0, 7.81],
                            [14.0, 8.84],
                            [6.0, 6.08],
                            [4.0, 5.39],
                            [12.0, 8.15],
                            [7.0, 6.42],
                            [5.0, 5.73]
                        ]
                    },
                    {
                        name: '抗压强度',
                        lineColor: 'balck',
                        min: 0,
                        max: 200,
                        groupId: 1,
                        data: [
                            [10.0, 7.46],
                            [8.0, 6.77],
                            [13.0, 12.74],
                            [9.0, 7.11],
                            [11.0, 7.81],
                            [14.0, 8.84],
                            [6.0, 6.08],
                            [4.0, 5.39],
                            [12.0, 8.15],
                            [7.0, 6.42],
                            [5.0, 5.73]
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
                        max: 2,
                        groupId: 4,
                        data: []
                    }
                ]
            }
        };
    },
    watch: {
        data(value, oldValue) {
            if (typeof value != 'undefined' && value != null) {

                const option = this.myChart.getOption();
                let series = option.series;
                ////console.log(series);
                series.forEach((item) => {
                    let { name } = item;
                    let temp = value.get(name);

                    if (temp && temp.length == 2) {
                        item.data.push(temp);
                    } else if (temp) {
                        let x = item.data;
                        temp.forEach(v => {
                            x.push(v);
                        })
                        item.data = x;
                    }
                });

                this.myChart.setOption({
                    series: series
                });
            }
        }
    },
    mounted() {
        const dom = document.getElementById('swimLane');
        dom.style.width = this.echartWidth + 'px';
        dom.style.height = this.echartHeight + 'px';
        this.myChart = this.$echarts.init(dom);
        if (typeof this.tableHead != 'undefined') {
            console.log(this.getDataMap(this.tableHead));
            this.draw(this.getDataMap(this.tableHead), this.myChart);
        }
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
                dataZoom: [],
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

                        if(params[0].axisType=="yAxis.category"){
                            val = '井深:' + (params[0].value[1]).split('\n')[0] + '(m)';
                            relVal = " ";
                        }

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
                    bottom: '2%',
                    right: '5%',
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
                }
            };
            const len = data.size;
            let percent = 90 / len;

            let num = 1;
            for (let [key, value] of data.entries()) {
                num = Math.max(num, value.length);
            }
            let topHeitht = 50 * num;
            ////console.log(len);
            for (let [key, value] of data.entries()) {
                let temp = percent * key + 6;
                let left = temp.toFixed(2) + '%';
                let legendLeft = (temp * this.echartWidth) / 100;
                let width = percent.toFixed(2) + '%';

                option.grid[key] = {
                    left: left,
                    width: width,
                    top: topHeitht,
                    bottom: this.echartBottom
                };
                option.graphic[key] = {
                    type: 'rect',
                    id: key + 'rect',
                    shape: {
                        x: this.echartWidth * temp / 100,
                        y: 0,
                        height: topHeitht,
                        width: this.echartWidth * percent / 100
                    },
                    style: {
                        fill: null,
                        stroke: '#333',
                        lineWidth: 1
                    }
                };
                // 每一格的高度
                let len = value.length;
                if (len == 0) continue;
                let height = topHeitht / len;
                let halfHeight = height / 2;
                value.forEach((item, index) => {
                    let pxWidth = item.name.pxWidth(item.name);
                    let labelWidth = (percent * this.echartWidth) / 100;
                    let offsetLegendLeft = (labelWidth - pxWidth - 55) / 2;
                    let offset = index * height;
                    let offsetXAxis = (value.length - 1 - index) * height;
                    let top = halfHeight + offset - 10;
                    option.legend[count] = {
                        textStyle: {
                            color: '#fft'
                        },
                        x: legendLeft + offsetLegendLeft,
                        y: top,
                        data: [item.name]
                    };
                    option.xAxis[count] = {
                        min: item.min,
                        max: item.max,
                        gridIndex: key,
                        position: 'top',
                        offset: offsetXAxis,
                        axisLabel: {
                            margin: 1,
                            formatter: (val, index) => {
                                const valLen = val.toString().length;
                                if (val === item.min) {
                                    if (valLen == 3) return '{a1|' + val + '}';
                                    if (valLen == 4) return '{a2|' + val + '}';
                                    if (valLen == 5) return '{a3|' + val + '}';
                                    return '{a|' + val + '}';
                                } else if (val === item.max) {
                                    if (valLen == 3) return '{b1|' + val + '}';
                                    if (valLen == 4) return '{b2|' + val + '}';
                                    return '{b|' + val + '}';
                                } else {
                                    return '{c|' + '' + '}';
                                }
                            },
                            showMaxLabel: true,
                            showMinLabel: true,
                            rich: {
                                a: {
                                    padding: [0, 0, 0, 15]
                                },
                                a1: {
                                    padding: [0, 0, 0, 22]
                                },
                                a2: {
                                    padding: [0, 0, 0, 32]
                                },
                                a3: {
                                    padding: [0, 0, 0, 42]
                                },
                                b: {
                                    padding: [0, 20, 0, 0]
                                },
                                b1: {
                                    padding: [0, 25, 0, 0]
                                },
                                b2: {
                                    padding: [0, 32, 0, 0]
                                },
                                c: {}
                            }
                        },
                        axisLine: {
                            onZero: false,
                            show:true
                        }
                    };
                    option.yAxis[count] = {
                        gridIndex: key,
                        axisLabel: {
                            show: count == 0 ? true : false,
                            // formatter: (value, index) => {
                            //     //console.log(temp);
                            //     if (index == 0) {
                            //         return '{a|' + value.toFixed(2) + '}';
                            //     }
                            //     return value.toFixed(2);
                            // },
                            showMaxLabel: false,
                            rich: {
                                a: {
                                    padding: [-20, 0, 0, 0]
                                }
                            }
                        },
                        axisTick: {
                            show: count == 0 ? true : false
                        },
                        axisLine: {
                            onZero: false,
                            show:true
                        },
                        inverse: true,
                        scale: true,
                        type:"category"
                    };
                    option.series[count] = {
                        name: item.name,
                        xAxisIndex: count,
                        yAxisIndex: count,
                        type: 'line',
                        data: item.data,
                        symbol: 'none'
                    };
                    count++;
                });
            }
            ////console.log(option);
            myChart.setOption(option);

            const initedOption = myChart.getOption();
            const xAxis = initedOption.xAxis;
            const yAxis = initedOption.yAxis;
            // 垂直深度
            let zeroPxForOne = myChart.convertToPixel({ gridIndex: 0 }, [0, 0]);
            option.graphic.push({
                type: 'rect',
                id: 100,
                shape: {
                    x: 0,
                    y: 0,
                    height: zeroPxForOne[1],
                    width: zeroPxForOne[0]
                },
                style: {
                    fill: null,
                    stroke: '#333',
                    lineWidth: 1
                }
            });
            option.graphic.push({
                type: 'rect',
                id: 101,
                shape: {
                    x: 0,
                    y: 0,
                    height: this.echartHeight - this.echartBottom,
                    width: zeroPxForOne[0]
                },
                style: {
                    fill: null,
                    stroke: '#333',
                    lineWidth: 1
                }
            });
            option.graphic.push({
                type: 'text',
                id: 102,
                style: {
                    text: '井深\n\n时间',
                    x: zeroPxForOne[0] / 2,
                    y: topHeitht / 2,
                    stroke: 'black',
                    font: '13px "STHeiti", sans-serif',
                    textAlign: 'center',
                    textVerticalAlign: 'middle'
                }
            });
            option.dataZoom.push({
                type: 'slider',
                show: true,
                yAxisIndex: yAxis.map((value, index) => index),
                width: 15,
                right: '4%',
                start: 65,
                end: 100
                // zoomLock: true
            });
            option.dataZoom.push({
                type: 'inside',
                show: true,
                yAxisIndex: yAxis.map((value, index) => index),
                start: 65,
                end: 100
                // zoomLock: true
            });
            myChart.setOption({
                graphic: option.graphic,
                dataZoom: option.dataZoom
            });
            ////console.log(myChart.getOption());
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
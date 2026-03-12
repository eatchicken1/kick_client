<template>
    <el-card class="box-card-container">
        <div id="wellStruture" style="height: 740px; width: 1300px"></div>
    </el-card>
</template>
<script>
import { getVerticalData } from '../../../api/index';
export default {
    name: 'Demo',
    data() {
        return {
            myChart: {},
            option: {}
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.myChart = this.$echarts.init(document.getElementById('wellStruture'));
            // 数据请求

            this.option = {
                animation: false,
                // grid: {
                //     top: 40,
                //     left: 50,
                //     right: 40,
                //     bottom: 50
                // },
                xAxis: {
                    // name: 'X',
                    // inverse: true,
                    // minorTick: {
                    //     show: true
                    // },
                    // splitLine: {
                    //     lineStyle: {
                    //         show: false
                    //     }
                    // },
                    // max: 1000
                    splitLine:{show: false},
                    show: false,
                },
                yAxis: {
                    // name: 'Y',
                    minorTick: {
                        show: true
                    },
                    splitLine: {
                        lineStyle: {
                            show: false
                        }
                    },
                    inverse: true,
                    max: 3500
                },

                series: [
                    {
                        type: 'line',
                        showSymbol: false,
                        clip: true,
                        smooth: true,
                        lineStyle: {
                            color: 'gray',
                            width: 15,
                        },
                        data: [
                            [100, 0],
                            [100, 1970]
                        ]
                    },
                    {
                        type: 'line',
                        showSymbol: false,
                       
                        clip: true,
                        smooth: true,
                        lineStyle: {
                            color: '#d63031',
                             type: "dotted",
                              dashOffset: 17
                        },
                        data: [
                           [180, 0],
                            [180, 1970]
                        ]
                    },
                    {
                        type: 'custom',
                        renderItem: function (params, api) {
                            console.log(api.value(0));
                            return {
                                type: 'arc',
                                shape: {
                                    cx: api.value(0),
                                    cy: api.value(1),
                                    r: api.value(2),
                                    // r0: api.value(3),
                                    r0: 50,
                                    startAngle: api.value(3),
                                    endAngle: api.value(4)
                                },
                                style: {
                                    stroke: api.value(5),
                                    fill: null,
                                    lineWidth: api.value(6)
                                }
                            };
                        },
                        silent: true,
                        data: [
                            [670, 380, 200, Math.PI / 2, Math.PI, '#ff3f34', 2],
                            //    [670, 380, 257, Math.PI / 2, Math.PI,"black",1],
                            [677, 380, 257, (Math.PI * 4.2) / 5, Math.PI, '#808e9b', 16],
                            [670, 380, 243, (Math.PI * 4.2) / 5, Math.PI, 'black', 2],
                            [670, 380, 235, Math.PI / 2, Math.PI, '#808e9b', 15],
                            [670, 380, 228, Math.PI / 2, Math.PI, 'black', 2],
                            [670, 380, 170, Math.PI / 2, Math.PI, 'black', 2],
                            [670, 380, 162, Math.PI / 2, Math.PI, '#808e9b', 15],
                            [677, 380, 154, (Math.PI * 4.2) / 5, Math.PI, '#808e9b', 15],
                            [677, 380, 162, (Math.PI * 4.2) / 5, Math.PI, 'black', 2]
                        ]
                    },

                    {
                        type: 'custom',
                        silent: true,
                        renderItem: function (params, api) {
                            console.log(api.value(0));
                            return {
                                type: 'rect',
                                shape: {
                                    x: api.value(0),
                                    y: api.value(1),
                                    width: api.value(2),
                                    height: api.value(3)
                                },
                                style: {
                                    stroke: api.value(4),
                                    fill: '#808e9b'
                                }
                            };
                        },
                        data: [
                            [390, 61, 22, 150, '#808e9b'],
                            [532, 61, 22, 150, '#808e9b'],
                            [412, 211, 15, 170, null],
                            [516, 211, 15, 170, null],
                            [427, 280, 15, 100, null],
                            [500, 280, 15, 100, null],
                            [412, 61, 0, 150, 'black'],
                            [427, 61, 0, 320, 'black'],
                            [442, 61, 0, 320, 'black'],
                            [470, 61, 0, 320, '#ff3f34'],
                            [500, 61, 0, 320, 'black'],
                            [515, 61, 0, 320, 'black'],
                            [670, 580, 280, 0, '#ff3f34'],
                            [531, 61, 0, 150, 'black'],

                            [670, 608, 280, 15, null],
                            [670, 535, 280, 16, null],
                            [670, 550, 280, 0, 'black'],
                            [670, 608, 280, 0, 'black'],

                            [948, 550, 1, 60, 'black']
                        ]
                    },
                    {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'polygon',
                                shape: {
                                    points: [
                                        [390, 210],
                                        [412, 210],
                                        [412, 200]
                                    ]
                                }
                            };
                        },
                        data: [
                            [390, 61],
                            [390, 88],
                            [400, 150]
                        ],
                        clip: true
                    },
                    {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'polygon',
                                shape: {
                                    points: [
                                        [532, 210],
                                        [555, 210],
                                        [532, 200]
                                    ]
                                }
                            };
                        },
                        data: [
                            [390, 61],
                            [390, 88],
                            [400, 150]
                        ],
                        clip: true
                    },
                    {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'polygon',
                                shape: {
                                    points: [
                                        [532, 450],
                                        [550, 451],
                                        [536, 456]
                                    ]
                                }
                            };
                        },
                        data: [
                            [390, 61],
                            [390, 88],
                            [400, 150]
                        ],
                        clip: true
                    },
                    {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'polygon',
                                shape: {
                                    points: [
                                        [445, 506],
                                        [453, 492],
                                        [458, 498]
                                    ]
                                }
                            };
                        },
                        data: [
                            [390, 61],
                            [390, 88],
                            [400, 150]
                        ],
                        clip: true
                    },
                      {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'polygon',
                                shape: {
                                    points: [
                                        [950, 550],
                                        [950, 535],
                                        [940, 550]
                                    ]
                                }
                            };
                        },
                        data: [
                            [390, 61],
                            [390, 88],
                            [400, 150]
                        ],
                        clip: true
                    },
                     {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'polygon',
                                shape: {
                                    points: [
                                        [950, 608],
                                        [950, 625],
                                        [940, 608]
                                    ]
                                }
                            };
                        },
                        data: [
                            [390, 61],
                            [390, 88],
                            [400, 150]
                        ],
                        clip: true
                    },
                     {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'line',
                                shape: {
                                    x1: api.value(0),
                                    y1: api.value(1),
                                    x2: api.value(2),
                                    y2: api.value(3)
                                },
                                draggable:true,
                                style: {
                                    stroke: "black"
                                }
                            };
                        },
                        data: [
                            [535,450,650,350],
                            [650,350,810,350],
                            [545,210,590,150],
                            [590,150,750,150],
                            [950,550,890,460],
                            [890,460,720,460],


                        ],
                        clip: true
                    },
                      {
                        type: 'custom',
                        renderItem: function (params, api) {
                            return {
                                type: 'text',
                                draggable:true,
                                style: {
                                    x: api.value(0),
                                    y: api.value(1),
                                    text: api.value(2),
                                    stroke: "black",
                                    font: '15px "STHeiti", sans-serif'
                                }
                            };
                        },
                        data: [
                            [650,355,"φ244.47mm × 2350m"],
                            [650,330,"φ311.15mm × 2351m"],
                              [590,131,"φ339.7mm × 900m"],
                            [590,155,"φ444.6mm × 901m"],
                               [720,440,"φ117.8mm × 3520m"],
                            [720,464,"φ216.9mm × 3522m"],


                        ],
                        clip: true
                    }
                ]
            };
            this.myChart.setOption(this.option);
        }
    }
};
</script>
<style scoped>
</style>
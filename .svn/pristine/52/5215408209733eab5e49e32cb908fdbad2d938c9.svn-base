<template>
    <el-card class="box-card-container">
        <div id="wellStruture" style="height: 740px; width: 1300px"></div>
        <el-drawer :visible.sync="edit" direction="rtl" size="40%" :modal="false" :with-header="false">
            <el-divider content-position="center"><span style="font-size: 18px">标注</span></el-divider>
            <el-button type="primary" @click="addlabel" style="margin-left: 10px; margin-bottom: 8px"> 添加 </el-button>
            <el-table :data="lastPontList" border style="width: 100%">
                <el-table-column property="index" label="序号" align="center" width="50"></el-table-column>
                <el-table-column prop="textTop" label="上方文字" align="center">
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.edit" v-model="scope.row[scope.column.property]"></el-input>
                        <span v-else> {{ scope.row[scope.column.property] }} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="textBottom" label="下方文字" align="center">
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.edit" v-model="scope.row[scope.column.property]"></el-input>
                        <span v-else> {{ scope.row[scope.column.property] }} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="index" label="操作" align="center" width="200px" fixed="right">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.edit" @click="saveRow(scope)" type="primary" size="mini" icon="el-icon-tickets">
                            保存
                        </el-button>
                        <el-button v-else type="primary" @click="editPreRow(scope)" size="mini" icon="el-icon-edit-outline">
                            编辑
                        </el-button>
                        <el-button type="danger" @click="deleteRow(scope)" size="mini" icon="el-icon-delete"> 移除 </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="demo-drawer__footer">
                <el-button style="width: 30%" @click="drawerCancel" size="medium">取 消</el-button>
                <el-button style="width: 30%" @click="drawerOk" size="medium" type="primary">确定</el-button>
            </div>
        </el-drawer>
    </el-card>
</template>
<script>
import { wellStructureData } from '../../../api/index';
import { Decimal } from 'decimal.js';
const eye = require('@/assets/icon/eye-regular.svg');
const eyeslash = require('@/assets/icon/eye-slash-regular.svg');
const edit = require('@/assets/icon/edit-regular.svg');
const editsolid = require('@/assets/icon/edit-solid.svg');
export default {
    name: 'WellStructure',
    props: {
        data: {
            type: Object
        },
        config: {
            type: Object
        }
    },
    data() {
        return {
            edit: false,
            myChart: {},
            option: {},
            wellStructureData: [],
            wellStartX: 50,
            wellWidth: 3,
            wellData: {},
            // 右侧套管底部一个点
            lastPontList: []
        };
    },
    mounted() {
        this.init();
    },
    // watch: {
    //     data(val,oldVal){
    //         if (typeof val != undefined) {
    //             this.init();
    //         }
    //     }
    // },
    methods: {
        drawerOk() {
            this.drawLableLineText(this.lastPontList, this.myChart);
            // 移动的点
            this.drawDragPointFirst(this.lastPontList, this.myChart, true);
            this.drawDragPointSecond(this.lastPontList, this.myChart, true);
            this.drawDragPointThird(this.lastPontList, this.myChart, true);
            this.edit = false;
        },
        drawerCancel() {
            this.edit = false;
        },
        saveRow(scope) {
            let temp = this.lastPontList[scope.$index];
            temp.edit = false;
            this.$set(this.lastPontList, scope.$index, temp);
        },
        // 编辑数据
        editPreRow(scope) {
            let temp = this.lastPontList[scope.$index];
            temp.edit = true;
            this.$set(this.lastPontList, scope.$index, temp);
        },
        // 移除
        deleteRow(scope) {
            const that = this;
            this.$confirm('确定移除？', '提示', {
                type: 'warning'
            })
                .then(function () {
                    that.myChart.setOption({
                        graphic: {
                            elements: [
                                {
                                    type: 'line',
                                    id: 'lableLine' + scope.row.index
                                }
                            ]
                        }
                    });
                    that.$delete(that.lastPontList, scope.$index);
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        addlabel() {
            let tempList = this.lastPontList;
            let obj = {
                index: tempList.length + 1,
                positionPx: [800, 300]
            };
            tempList.push(obj);
            this.lastPontList = tempList;
        },

        // 初始化相关信息
        init() {
            // 初始化chart对象
            this.myChart = this.$echarts.init(document.getElementById('wellStruture'));
            if (typeof this.data != 'undefined') {
                this.initData(this.data);
            } else {
                wellStructureData()
                    .then((res) => {
                        this.initData(res);
                    })
                    .catch((err) => {
                        console.log(err);
                        // this.$message.error('数据请求失败');
                    });
            }
        },
        initData(res, config) {
            this.wellData = res;
            console.log(this.wellData);
            this.drawAxis(res.maxVerticalHeight, this.myChart);
            console.log(res.stratum);
            this.drawStrata(res.stratum.map(this.objectToArray), this.myChart);
            // 最大值最小值的标注
            const scaleParam = {
                start: 14,
                end: 28,
                maxValue: '2.30',
                minValue: '0'
            };
            this.drawScale(scaleParam, this.myChart);
            this.drawDensity(res.density.map(this.objectToArray), this.myChart);
            this.drawPressure(res.pressureCoefficient.map(this.objectToArray), this.myChart);
            this.drawCentralAxis(res.keyPoints, this.myChart);
            this.drawLineReferToMiddle(res.keyPoints, res.data, this.myChart);
            ////////console.log(this.lastPontList);
            this.drawLableLineText(this.lastPontList, this.myChart);
            // 移动的点
            this.drawDragPointFirst(this.lastPontList, this.myChart, true);
            this.drawDragPointSecond(this.lastPontList, this.myChart, true);
            this.drawDragPointThird(this.lastPontList, this.myChart, true);
            // this.drawTools();
        },
        // 坐标绘制
        drawAxis(maxVerticalHeight, myChart) {
            myChart.setOption({
                xAxis: {
                    min: 0,
                    max: 100,
                    splitNumber: 2
                },
                tooltip: {
                    // trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                        //  snap: true,
                    }
                },
                yAxis: {
                    inverse: true,
                    min: 0,
                    max: this.yAxisMaxValue(maxVerticalHeight),
                    splitNumber: 1,
                    splitLine: false
                },
                toolbox: {
                    show: true,
                    emphasis: {
                        iconStyle: {
                            textPosition: 'top'
                        }
                    },
                    feature: {
                        myIsEdit1: {
                            show: true,
                            title: '编辑',
                            icon: 'image://' + edit,
                            onclick: (param, api, name, event) => {
                                this.edit = true;
                                let feature = myChart.getOption().toolbox[0].feature;
                                feature.myIsEdit.title = '显示拖拽点';
                                feature.myIsEdit.icon = 'image://' + eye;
                                this.dragPointDatahide();
                                this.myChart.setOption({
                                    toolbox: {
                                        feature: feature
                                    }
                                });
                            }
                        },
                        myIsEdit: {
                            show: true,
                            title: '显示拖拽点',
                            icon: 'image://' + eye,
                            onclick: (param, api, name, event) => {
                                let feature = myChart.getOption().toolbox[0].feature;
                                console.log(myChart.getOption().toolbox[0].feature);
                                if (feature.myIsEdit.title == '显示拖拽点') {
                                    feature.myIsEdit.title = '隐藏拖拽点';
                                    feature.myIsEdit.icon = 'image://' + eyeslash;
                                    this.dragPointDataShow();
                                } else {
                                    feature.myIsEdit.title = '显示拖拽点';
                                    feature.myIsEdit.icon = 'image://' + eye;
                                    this.dragPointDatahide();
                                }
                                this.myChart.setOption({
                                    toolbox: {
                                        feature: feature
                                    }
                                });
                            }
                        },
                        saveAsImage: {
                            name: '井身结构'
                        }
                    },
                    right: 125,
                    top: 28
                }
            });
        },
        // 地层绘制
        drawStrata(data, myChart) {
            myChart.setOption({
                series: [
                    {
                        type: 'custom',
                        id: 'strata',
                        name: '地层',
                        renderItem: (params, api) => {
                            let minPoint = api.coord([0, api.value(0)]);
                            let maxPoint = api.coord([0, api.value(1)]);
                            let width = api.coord([10, 0]);
                            let offset = api.coord([0, 0]);
                            // 渲染矩形区域(层位),改为标注类型
                            let center = [minPoint[0],(minPoint[1] + maxPoint[1]) / 2];
                            let labelEnd = [center[0] + 40, center[1] - 10];
                            let stratum = {
                                type: 'line',
                                shape: {
                                    x1: center[0],
                                    y1: center[1],
                                    x2: labelEnd[0],
                                    y2: labelEnd[1],
                                },
                                style: {
                                    fill: null,
                                    lineWidth: 0.5,
                                    stroke: 'black'
                                }
                            };
                            // 层位名称
                            let name = api.value(2);
                            let height = {
                                type: 'text',
                                style: {
                                    x: offset[0] - 10,
                                    y: maxPoint[1],
                                    text: api.value(1),
                                    stroke: 'black',
                                    font: '12px "STHeiti", sans-serif',
                                    textAlign: 'right',
                                    textVerticalAlign: 'middle'
                                }
                            };
                            // 层位名称标识
                            let text = {
                                type: 'text',
                                style: {
                                    x: labelEnd[0],
                                    y: labelEnd[1],
                                    text: name,
                                    stroke: 'black',
                                    font: '12px "STHeiti", sans-serif',
                                    textAlign: 'left',
                                    textVerticalAlign: 'middle'
                                }
                            };
                            // 层位刻度标识
                            let stratumScale = {
                                type: 'line',
                                shape: {
                                    x1: maxPoint[0],
                                    y1: maxPoint[1],
                                    x2: maxPoint[0] - 5,
                                    y2: maxPoint[1]
                                },
                                style: {
                                    lineWidth: 0.5,
                                    stroke: 'black'
                                }
                            };
                            // 拖动点

                            return {
                                type: 'group',
                                children: [stratum, text, height, stratumScale]
                            };
                        },
                        data: data
                    }
                ]
            });
        },
        // 钻井液密度刻度
        drawScale(param, myChart) {
            /**
             * param : {
             *      start: 开始横坐标
             *      end: 结束横坐标
             *      maxValue: 最大值
             *      minValue: 最小值
             *
             * }
             */
            const data = [];
            for (let i = param.start; i <= param.end; i++) {
                data.push(i);
            }
            myChart.setOption({
                series: [
                    {
                        type: 'custom',
                        id: 'scale',
                        name: '刻度',
                        renderItem: (params, api) => {
                            let value = api.value(0);
                            let point = api.coord([value, 0]);
                            let yScale = {
                                type: 'line',
                                shape: {
                                    x1: point[0],
                                    y1: point[1],
                                    x2: point[0],
                                    y2: point[1] - 5
                                },
                                style: {
                                    lineWidth: 0.5,
                                    stroke: 'black'
                                }
                            };
                            let text = null;
                            if (value == param.start || value == param.end) {
                                let num = param.minValue;
                                if (value == param.end) num = param.maxValue;
                                text = {
                                    type: 'text',
                                    style: {
                                        x: point[0],
                                        y: point[1] - 12,
                                        text: num,
                                        stroke: 'black',
                                        font: '8px "STHeiti", sans-serif',
                                        textAlign: 'center',
                                        textVerticalAlign: 'middle'
                                    }
                                };
                            }

                            // 横坐标刻度
                            return {
                                type: 'group',
                                children: [yScale, text]
                            };
                        },
                        data: data
                    }
                ]
            });
        },
        // 钻井液密度
        drawDensity(data, myChart) {
            // data : res.density.map(this.objectToArray)
            myChart.setOption({
                series: [
                    {
                        type: 'custom',
                        id: 'density',
                        name: '钻井液密度',
                        renderItem: (params, api) => {
                            // 密度横坐标
                            let minDensity = api.value(0);
                            let maxDensity = api.value(1);
                            let x1 = minDensity * 10 + 5;
                            let x2 = maxDensity * 10 + 5;
                            if (minDensity == 0) {
                                x1 = 14;
                            }
                            if (maxDensity == 0) {
                                x2 = 14;
                            }
                            let leftTop = api.coord([x1, api.value(2)]);
                            let leftBottom = api.coord([x1, api.value(3)]);
                            let rightTop = api.coord([x2, api.value(2)]);
                            let density = {
                                type: 'rect',
                                shape: {
                                    x: leftTop[0],
                                    y: leftTop[1],
                                    width: rightTop[0] - leftTop[0],
                                    height: leftBottom[1] - leftTop[1]
                                },
                                style: {
                                    fill: '#95a5a6',
                                    lineWidth: 0.5,
                                    stroke: 'black'
                                }
                            };
                            // 横线
                            const preData = params.context.preData;
                            let horizontalLine = null;
                            if (preData) {
                                horizontalLine = {
                                    type: 'line',
                                    shape: {
                                        x1: preData[0],
                                        y1: preData[1],
                                        x2: leftTop[0],
                                        y2: leftTop[1]
                                    },
                                    style: {
                                        fill: '#95a5a6',
                                        lineWidth: 0.5,
                                        stroke: 'black'
                                    }
                                };
                            }
                            params.context.preData = [rightTop[0], leftBottom[1]];
                            // 钻井液密度标识字符串
                            let str = minDensity + '-' + maxDensity;
                            let text = {
                                type: 'text',
                                style: {
                                    x: rightTop[0] + 10,
                                    y: (leftBottom[1] + leftTop[1]) / 2,
                                    text: str,
                                    stroke: 'black',
                                    font: '8px "STHeiti", sans-serif',
                                    textAlign: 'left',
                                    textVerticalAlign: 'middle'
                                }
                            };
                            return {
                                type: 'group',
                                children: [density, text, horizontalLine]
                            };
                        },
                        data: data
                    }
                ]
            });
        },
        // 地层空隙压力系数
        drawPressure(data, myChart) {
            // data: res.pressureCoefficient.map(this.objectToArray)
            myChart.setOption({
                series: [
                    {
                        type: 'custom',
                        id: 'pressure',
                        name: '地层空隙压力',
                        renderItem: (params, api) => {
                            let value = api.value(0);
                            let minHeight = api.value(1);
                            let maxHeight = api.value(2);
                            let x = value * 10 + 5;
                            let min = api.coord([x, minHeight]);
                            let max = api.coord([x, maxHeight]);
                            // 竖线
                            let pressureCoefficient = {
                                type: 'line',
                                shape: {
                                    x1: min[0],
                                    y1: min[1],
                                    x2: max[0],
                                    y2: max[1]
                                },
                                style: {
                                    fill: '#95a5a6',
                                    lineWidth: 1,
                                    stroke: 'red'
                                }
                            };
                            // 横线
                            const preData = params.context.preData;
                            // //////////console.log(preData)
                            let horizontalLine = null;
                            if (preData) {
                                horizontalLine = {
                                    type: 'line',
                                    shape: {
                                        x1: preData[0],
                                        y1: preData[1],
                                        x2: min[0],
                                        y2: min[1]
                                    },
                                    style: {
                                        fill: '#95a5a6',
                                        lineWidth: 1,
                                        stroke: 'red'
                                    }
                                };
                            }
                            params.context.preData = [max[0], max[1]];
                            // 地层空隙压力系数
                            let text = {
                                type: 'text',
                                style: {
                                    x: min[0] - 10,
                                    y: (min[1] + max[1]) / 2,
                                    text: value,
                                    stroke: 'black',
                                    font: '8px "STHeiti", sans-serif',
                                    textAlign: 'right',
                                    textVerticalAlign: 'middle'
                                }
                            };
                            return {
                                type: 'group',
                                children: [pressureCoefficient, text, horizontalLine]
                            };
                        },
                        data: data
                    }
                ]
            });
        },
        // 中轴线绘制
        drawCentralAxis(keyPoints, myChart) {
            // this.getMiddleLine(this.wellData.keyPoints)
            myChart.setOption({
                series: [
                    // 中轴线
                    {
                        type: 'line',
                        id: 'middleLine',
                        smooth: 1,
                        showSymbol: false,
                        lineStyle: {
                            color: 'red',
                            width: 1,
                            type: 'dotted'
                        },
                        data: this.getMiddleLine(keyPoints)
                    }
                ]
            });
        },
        // 根据垂深的最大值，设置纵坐标的最大值
        yAxisMaxValue(value) {
            let changeFeed = 0;
            if(value > 3000) changeFeed = 100;
            if(value > 4000) changeFeed = 200;
            if(value > 5000) changeFeed = 300;
            if(value > 6000) changeFeed = 400;
            if(value > 7000) changeFeed = 500;
            if(value > 8000) changeFeed = 600;
            return (Math.floor(value / 400) + 1) * 400  + changeFeed;
        },
        // 对象转数组
        objectToArray(obj) {
            let ret = [];
            if (obj) {
                Object.keys(obj).forEach((key) => ret.push(obj[key]));
            }
            return ret;
        },
        // 计算辅助点
        getExtraPoint(length, split, radian) {
            let x = 0;
            let y = 0;
            let r = new Decimal(length);
            let angle = new Decimal(Math.PI).div(new Decimal(2));
            if (radian) {
                angle = new Decimal(radian);
            }
            let ret = [];
            for (let i = 1; i < split; i++) {
                let tempAngle = angle.mul(new Decimal(i)).div(new Decimal(split));
                x = r.mul(Decimal.cos(tempAngle));
                y = r.mul(Decimal.sin(tempAngle));
                ret.push([r.sub(x).toNumber(), y.toNumber()]);
            }
            return ret;
        },
        // 中轴线数据
        getMiddleLine(value, flag) {
            // //////////console.log(value);
            // 计算平滑曲线结束时的坐标
            // 井口
            let ret = [];
            // 井口
            ret.push([50, 0]);
            // 造斜点
            let one = [50, value[0].height];
            ret.push(one);

            // 造斜结束点 A点
            let k = this.myChart.convertToPixel('grid', one);
            // //////////console.log();
            let temp = this.myChart.convertToPixel('grid', [50, value[1].height]);
            // 边长
            let len = temp[1] - k[1];
            // //////////console.log(len);
            if (!flag) {
                let extras = this.getExtraPoint(len, 20);
                // //////////console.log(extras);
                extras.forEach((value) => {
                    ret.push(this.myChart.convertFromPixel('grid', [k[0] + value[0], k[1] + value[1]]));
                });
            }
            let A = this.myChart.convertFromPixel('grid', [k[0] + len, temp[1]]);
            ret.push(A);
            // B点
            let B = [90, value[2].height];
            ret.push(B);
            // //////////console.log(ret);
            return ret;
        },
        // 外径与横坐标的转换关系
        convertDiameter(paramR, minR) {
            // 定义最小套管的套管外径在横坐标上的距离
            const minDiametertoX = this.wellWidth;
            return (minDiametertoX * paramR) / minR;
        },
        calculationPoint(
            casingBottomHeight,
            kpointy,
            leftData,
            keyPointsAxis,
            offset,
            rightData,
            myChart,
            K,
            len,
            offsetpx,
            B,
            A,
            wellDeep,
            keyPoints
        ) {
            // console.log(casingBottomHeight,kpointy,keyPointsAxis[2][1])
            if (casingBottomHeight < kpointy) {
                // 第二个点

                leftData.push([keyPointsAxis[0][0] - offset, casingBottomHeight]);
                rightData.push([keyPointsAxis[0][0] + offset, casingBottomHeight]);
                // 如果位于造斜点之下，造斜结束点之上
            } else if (casingBottomHeight > kpointy && casingBottomHeight < keyPointsAxis[2][1]) {
                // 放入造斜点
                const leftK = [keyPointsAxis[1][0] - offset, keyPointsAxis[1][1]];
                const rightK = [keyPointsAxis[1][0] + offset, keyPointsAxis[1][1]];
                const leftkpx = myChart.convertToPixel('grid', leftK);
                const rightkpx = myChart.convertToPixel('grid', rightK);
                leftData.push(leftK);
                rightData.push(rightK);
                // 计算弧线关键点
                // c点为套管的端点
                const C = myChart.convertToPixel('grid', [50, casingBottomHeight]);
                // 垂直高度变化量
                const H = C[1] - K[1];
                const pointsArrLeft = this.getExtraPoint(len + offsetpx, 20, Decimal.asin(H / len).toNumber());
                const pointsArrRight = this.getExtraPoint(len - offsetpx, 20, Decimal.asin(H / len).toNumber());
                pointsArrLeft.forEach((dot) => {
                    leftData.push(myChart.convertFromPixel('grid', [leftkpx[0] + dot[0], leftkpx[1] + Math.abs(dot[1])]));
                });
                pointsArrRight.forEach((dot) => {
                    rightData.push(myChart.convertFromPixel('grid', [rightkpx[0] + dot[0], rightkpx[1] + Math.abs(dot[1])]));
                });
            } else {
                const leftK = [keyPointsAxis[1][0] - offset, keyPointsAxis[1][1]];
                const rightK = [keyPointsAxis[1][0] + offset, keyPointsAxis[1][1]];
                const leftkpx = myChart.convertToPixel('grid', leftK);
                const rightkpx = myChart.convertToPixel('grid', rightK);
                leftData.push(leftK);
                rightData.push(rightK);
                // 越过弧形段
                // console.log(len,offsetpx);
                const pointsArrLeft = this.getExtraPoint(len + offsetpx, 20);
                const pointsArrRight = this.getExtraPoint(len - offsetpx, 20);
                pointsArrLeft.forEach((dot) => {
                    const dotLeft = myChart.convertFromPixel('grid', [leftkpx[0] + dot[0], leftkpx[1] + dot[1]]);
                    leftData.push(dotLeft);
                });
                pointsArrRight.forEach((dot) => {
                    const dotRight = myChart.convertFromPixel('grid', [rightkpx[0] + dot[0], rightkpx[1] + dot[1]]);
                    rightData.push(dotRight);
                });

                // A点处的坐标
                // const leftA = [keyPointsAxis[2][0], keyPointsAxis[2][1] - offsetY];
                // const rightA = [keyPointsAxis[2][0], keyPointsAxis[2][1] + offsetY];
                const leftA = myChart.convertFromPixel('grid', [A[0], A[1] + offsetpx]);
                const rightA = myChart.convertFromPixel('grid', [A[0], A[1] - offsetpx]);
                //////////console.log(leftA, rightA);
                leftData.push(leftA);
                rightData.push(rightA);
                // 水平段在图上的像素长度
                const horizontalLen = B[0] - A[0];
                // 套管在水平段上的位置
                const horizontalPosition = (horizontalLen * (wellDeep - keyPoints[1].deep)) / (keyPoints[2].deep - keyPoints[1].deep);
                // 得到水平点的坐标
                const horizontalLeft = myChart.convertFromPixel('grid', [A[0] + horizontalPosition, B[1] + offsetpx]);
                const horizontalRight = myChart.convertFromPixel('grid', [A[0] + horizontalPosition, B[1] - offsetpx]);
                leftData.push(horizontalLeft);
                rightData.push(horizontalRight);
            }
            //
            leftData.push(leftData[leftData.length - 1]);
            rightData.push(rightData[rightData.length - 1]);
        },
        // 绘制套管内壁水泥返高
        drawLineReferToMiddle(keyPoints, openTimeData, myChart) {
            console.log(openTimeData);
            const minR = openTimeData[openTimeData.length - 1].casingOuterDiameter;
            const keyPointsAxis = this.getMiddleLine(keyPoints, true);
            const K = myChart.convertToPixel('grid', keyPointsAxis[1]);
            const A = myChart.convertToPixel('grid', keyPointsAxis[2]);
            const B = myChart.convertToPixel('grid', keyPointsAxis[3]);
            const len = A[0] - K[0];
            // 前一次的offset;
            let preOffset = 0;
            for (let value of openTimeData) {
                let leftData = [];
                let rightData = [];

                let {
                    casingTopHeight,
                    casingBottomHeight,
                    casingTopDeep,
                    casingBottomDeep,
                    casingOuterDiameter,
                    wellDeep,
                    index,
                    cemmentReturnHeight,
                    boresize
                } = value;
                let offset = this.convertDiameter(casingOuterDiameter, minR);
                let offsetPoint = myChart.convertToPixel('grid', [offset, 0]);
                let zero = myChart.convertToPixel('grid', [0, 0]);
                let offsetpx = offsetPoint[0] - zero[0];

                // 第一个点
                leftData.push([keyPointsAxis[0][0] - offset, 0]);
                rightData.push([keyPointsAxis[0][0] + offset, 0]);
                // 造斜点纵坐标
                const kpointy = keyPointsAxis[1][1];
                // 如果点位于造斜点之上 直接添加到数组中
                this.calculationPoint(
                    casingBottomHeight,
                    kpointy,
                    leftData,
                    keyPointsAxis,
                    offset,
                    rightData,
                    myChart,
                    K,
                    len,
                    offsetpx,
                    B,
                    A,
                    wellDeep,
                    keyPoints
                );

                // 水泥环
                let leftCemmentData = [];
                let rightCemmentData = [];
                // 偏移量
                let middleOffset;
                let cemmentlineWidth;
                if (value.index == 1) {
                    let cemmentOffset = this.convertDiameter(boresize, minR);
                    middleOffset = (offset + cemmentOffset) / 2;
                    let lineWidthAxis = cemmentOffset - offset;
                    cemmentlineWidth = myChart.convertToPixel('grid', [lineWidthAxis, lineWidthAxis])[0] - zero[0];
                } else {
                    middleOffset = (offset + preOffset) / 2;
                    let lineWidthAxis = preOffset - offset;
                    cemmentlineWidth = myChart.convertToPixel('grid', [lineWidthAxis, lineWidthAxis])[0] - zero[0];
                }
                let cemmentOffsetPx = myChart.convertToPixel('grid', [middleOffset, middleOffset])[0] - zero[0];

                //第一个点
                // 在造斜点之上
                if (cemmentReturnHeight < kpointy) {
                    leftCemmentData.push([keyPointsAxis[0][0] - middleOffset, cemmentReturnHeight]);
                    rightCemmentData.push([keyPointsAxis[0][0] + middleOffset, cemmentReturnHeight]);
                    this.calculationPoint(
                        casingBottomHeight,
                        kpointy,
                        leftCemmentData,
                        keyPointsAxis,
                        middleOffset,
                        rightCemmentData,
                        myChart,
                        K,
                        len,
                        cemmentOffsetPx,
                        B,
                        A,
                        wellDeep,
                        keyPoints
                    );
                }
                // 套管鞋的绘制
                let leftPolygonData = [];
                let rightPolygonData = [];
                let lastLeftPoint = leftData[leftData.length - 2];
                let lastrightPoint = rightData[leftData.length - 2];
                let lastLeftPointPx = myChart.convertToPixel('grid', lastLeftPoint);
                let lastrightPointPx = myChart.convertToPixel('grid', lastrightPoint);

                // 记录套套管鞋位置信息
                this.lastPontList.push({ ...value, position: lastrightPoint, positionPx: lastrightPointPx });
                leftPolygonData.push(lastLeftPointPx);
                rightPolygonData.push(lastrightPointPx);
                if (casingBottomHeight < kpointy) {
                    leftPolygonData.push([lastLeftPointPx[0] - cemmentlineWidth, lastLeftPointPx[1]]);
                    rightPolygonData.push([lastrightPointPx[0] + cemmentlineWidth, lastrightPointPx[1]]);

                    leftPolygonData.push([lastLeftPointPx[0], lastLeftPointPx[1] - cemmentlineWidth / 2]);
                    rightPolygonData.push([lastrightPointPx[0], lastrightPointPx[1] - cemmentlineWidth / 2]);
                } else if (casingBottomHeight > kpointy && casingBottomHeight < keyPointsAxis[2][1]) {
                    let leftH = lastLeftPointPx[1] - K[1];
                    let angle = Decimal.asin(leftH / (len + offsetpx)).toNumber();
                    let offsetX = Decimal.sin(angle) * cemmentlineWidth;
                    let offsetY = Decimal.cos(angle) * cemmentlineWidth;
                    leftPolygonData.push([lastLeftPointPx[0] - offsetX, lastLeftPointPx[1] + offsetY]);
                    rightPolygonData.push([lastrightPointPx[0] + offsetY, lastrightPointPx[1] - offsetX]);

                    // 第三个点
                    let angle2 = cemmentlineWidth / 2 / (len + offsetpx);
                    let angle4 = cemmentlineWidth / 2 / (len - offsetpx);

                    let angele3 = angle - angle2;
                    let leftHeight = Decimal.sin(angele3).toNumber() * (len + offsetpx);
                    let leftWidth = Decimal.cos(angele3).toNumber() * (len + offsetpx);

                    let angle5 = angle - angle4;
                    let rightHeight = Decimal.sin(angle5).toNumber() * (len - offsetpx);
                    let rightWidth = Decimal.cos(angle5).toNumber() * (len - offsetpx);
                    leftPolygonData.push([K[0] - offsetpx + (len + offsetpx - leftWidth), K[1] + leftHeight]);
                    rightPolygonData.push([K[0] + offsetpx + (len - offsetpx - rightWidth), K[1] + rightHeight]);
                } else {
                    leftPolygonData.push([lastLeftPointPx[0], lastLeftPointPx[1] + cemmentlineWidth]);
                    rightPolygonData.push([lastrightPointPx[0], lastrightPointPx[1] - cemmentlineWidth]);

                    leftPolygonData.push([lastLeftPointPx[0] - cemmentlineWidth / 2, lastLeftPointPx[1]]);
                    rightPolygonData.push([lastrightPointPx[0] - cemmentlineWidth / 2, lastrightPointPx[1]]);
                }
                preOffset = offset;

                myChart.setOption({
                    graphic: {
                        elements: [
                            {
                                type: 'polygon',
                                id: 'polygonLeft' + index,
                                shape: {
                                    points: leftPolygonData
                                },
                                z: 150
                            },
                            {
                                type: 'polygon',
                                id: 'polygonRight' + index,
                                shape: {
                                    points: rightPolygonData
                                },
                                z: 150
                            }
                        ]
                    },
                    series: [
                        {
                            type: 'line',
                            id: 'innerwallleft' + index,
                            smooth: 1,
                            showSymbol: false,
                            lineStyle: {
                                color: 'black',
                                width: 2
                            },
                            z: 100,
                            data: leftData
                        },
                        {
                            type: 'line',
                            id: 'innerwallright' + index,
                            smooth: 1,
                            showSymbol: false,
                            lineStyle: {
                                color: 'black',
                                width: 2
                            },
                            z: 100,
                            data: rightData
                        },
                        {
                            type: 'line',
                            id: 'commentLift' + index,
                            smooth: 1,
                            showSymbol: false,
                            lineStyle: {
                                color: '#718093',
                                width: cemmentlineWidth - 1,
                                cap: 'round'
                            },
                            data: leftCemmentData
                        },
                        {
                            type: 'line',
                            id: 'commentRight' + index,
                            smooth: 1,
                            showSymbol: false,
                            lineStyle: {
                                color: '#718093',
                                width: cemmentlineWidth - 1
                            },
                            data: rightCemmentData
                        }
                    ]
                });
            }
        },
        // 绘制标注
        drawLableLineText(list, myChart) {
            ////////console.log(list);

            for (let value of list) {
                ////////console.log(value);
                let textTop = value.textTop ? value.textTop : 'φ' + value.casingOuterDiameter + 'mm X ' + value.casingBottomDeep + 'm';
                let textBottom = value.textBottom ? value.textBottom : 'φ' + value.boresize + 'mm X ' + value.wellDeep + 'm';
                let point = [];
                value.textTop = textTop;
                value.textBottom = textBottom;
                // 第一个点
                point.push(value.positionPx);
                let lastrightPointPx = value.positionPx;
                ////////console.log(lastrightPointPx);
                let secondOffsetX = value.secondOffsetX ? value.secondOffsetX : 50;
                let secondOffsetY = value.secondOffsetY ? value.secondOffsetY : -50;
                let thirdOffsetX = value.thirdOffsetX ? value.thirdOffsetX : 125;
                // 第二个点
                let secondPoint = [lastrightPointPx[0] + secondOffsetX, lastrightPointPx[1] + secondOffsetY];
                let thirdPoint = [secondPoint[0] + thirdOffsetX, secondPoint[1]];
                // let secondPointAxis = myChart.convertFromPixel('grid', secondPoint);
                point.push(secondPoint);
                point.push(thirdPoint);
                myChart.setOption({
                    graphic: {
                        elements: [
                            {
                                type: 'line',
                                id: 'lableLine' + value.index,
                                z: 150,
                                shape: {
                                    x1: point[0][0],
                                    y1: point[0][1],
                                    x2: point[1][0],
                                    y2: point[1][1]
                                }
                            },
                            {
                                type: 'line',
                                id: 'lableLine1' + value.index,
                                z: 150,
                                shape: {
                                    x1: point[1][0],
                                    y1: point[1][1],
                                    x2: point[2][0],
                                    y2: point[2][1]
                                }
                            },
                            {
                                type: 'text',
                                id: 'lableTextTop' + value.index,
                                style: {
                                    text: textTop,
                                    x: (point[1][0] + point[2][0]) / 2,
                                    y: point[1][1] - 5,
                                    textVerticalAlign: 'bottom',
                                    textAlign: 'center'
                                }
                            },
                            {
                                type: 'text',
                                id: 'lableTextBottom' + value.index,
                                style: {
                                    text: textBottom,
                                    x: (point[1][0] + point[2][0]) / 2,
                                    y: point[1][1] + 5,
                                    textVerticalAlign: 'top',
                                    textAlign: 'center'
                                }
                            }
                        ]
                    }
                });
            }
        },
        // 拖动的点
        drawDragPointFirst(list, myChart, visible) {
            if (typeof visible == 'undefined') visible = false;
            for (let value of list) {
                let point = [];
                // 第一个点
                point.push(value.positionPx);
                let lastrightPointPx = value.positionPx;
                ////////console.log(lastrightPointPx);
                let secondOffsetX = value.secondOffsetX ? value.secondOffsetX : 50;
                let secondOffsetY = value.secondOffsetY ? value.secondOffsetY : -50;
                let thirdOffsetX = value.thirdOffsetX ? value.thirdOffsetX : 125;
                // 第二个点
                let secondPoint = [lastrightPointPx[0] + secondOffsetX, lastrightPointPx[1] + secondOffsetY];
                let thirdPoint = [secondPoint[0] + thirdOffsetX, secondPoint[1]];
                // let secondPointAxis = myChart.convertFromPixel('grid', secondPoint);
                point.push(secondPoint);
                point.push(thirdPoint);
                myChart.setOption({
                    graphic: {
                        elements: [
                            {
                                type: 'circle',
                                id: 'circlePoint' + value.index,
                                position: point[0],
                                shape: {
                                    cx: 0,
                                    cy: 0,
                                    r: 3
                                },
                                style: {
                                    fill: 'white',
                                    lineWidth: 2,
                                    stroke: '#d63031'
                                },
                                z: 500,
                                invisible: visible,
                                draggable: true,
                                ondrag: (param) => {
                                    let offsetX = param.offsetX;
                                    let offsetY = param.offsetY;
                                    let temp = this.lastPontList[value.index - 1];
                                    temp.positionPx = [offsetX, offsetY];
                                    this.lastPontList[value.index - 1] = temp;
                                    ////console.log(this.lastPontList);
                                    this.drawLableLineText([this.lastPontList[value.index - 1]], myChart);
                                    this.drawDragPointSecond([this.lastPontList[value.index - 1]], myChart);
                                    this.drawDragPointThird([this.lastPontList[value.index - 1]], myChart);
                                }
                            }
                        ]
                    }
                });
            }
        },
        drawDragPointSecond(list, myChart, visible) {
            if (typeof visible == 'undefined') visible = false;
            for (let value of list) {
                let point = [];
                // 第一个点
                point.push(value.positionPx);
                let lastrightPointPx = value.positionPx;
                ////////console.log(lastrightPointPx);
                let secondOffsetX = value.secondOffsetX ? value.secondOffsetX : 50;
                let secondOffsetY = value.secondOffsetY ? value.secondOffsetY : -50;
                let thirdOffsetX = value.thirdOffsetX ? value.thirdOffsetX : 125;
                // 第二个点
                let secondPoint = [lastrightPointPx[0] + secondOffsetX, lastrightPointPx[1] + secondOffsetY];
                let thirdPoint = [secondPoint[0] + thirdOffsetX, secondPoint[1]];
                // let secondPointAxis = myChart.convertFromPixel('grid', secondPoint);
                point.push(secondPoint);
                point.push(thirdPoint);
                //console.log(point);
                myChart.setOption({
                    graphic: {
                        elements: [
                            {
                                type: 'circle',
                                id: 'circlePoint1' + value.index,
                                position: secondPoint,
                                shape: {
                                    cx: 0,
                                    cy: 0,
                                    r: 3
                                },
                                style: {
                                    fill: 'white',
                                    lineWidth: 2,
                                    stroke: '#d63031'
                                },
                                z: 500,
                                invisible: visible,
                                draggable: true,
                                ondrag: (param) => {
                                    //console.log(point[1]);
                                    let offsetX = param.offsetX;
                                    let offsetY = param.offsetY;
                                    //////console.log([offsetX, offsetY]);
                                    let temp = this.lastPontList[value.index - 1];
                                    temp.secondOffsetX = offsetX - point[0][0];
                                    temp.secondOffsetY = offsetY - point[0][1];
                                    this.lastPontList[value.index - 1] = temp;
                                    ////console.log(param)
                                    ////console.log(temp)
                                    //console.log(param);
                                    this.drawLableLineText([this.lastPontList[value.index - 1]], myChart);
                                    this.drawDragPointThird([this.lastPontList[value.index - 1]], myChart);
                                }
                            }
                        ]
                    }
                });
            }
        },
        drawDragPointThird(list, myChart, visible) {
            if (typeof visible == 'undefined') visible = false;
            for (let value of list) {
                let point = [];
                // 第一个点
                point.push(value.positionPx);
                let lastrightPointPx = value.positionPx;
                ////////console.log(lastrightPointPx);
                let secondOffsetX = value.secondOffsetX ? value.secondOffsetX : 50;
                let secondOffsetY = value.secondOffsetY ? value.secondOffsetY : -50;
                let thirdOffsetX = value.thirdOffsetX ? value.thirdOffsetX : 125;
                // 第二个点
                let secondPoint = [lastrightPointPx[0] + secondOffsetX, lastrightPointPx[1] + secondOffsetY];
                let thirdPoint = [secondPoint[0] + thirdOffsetX, secondPoint[1]];
                // let secondPointAxis = myChart.convertFromPixel('grid', secondPoint);
                point.push(secondPoint);
                point.push(thirdPoint);
                myChart.setOption({
                    graphic: {
                        elements: [
                            {
                                type: 'circle',
                                id: 'circlePoint2' + value.index,
                                position: thirdPoint,
                                shape: {
                                    cx: 0,
                                    cy: 0,
                                    r: 3
                                },
                                style: {
                                    fill: 'white',
                                    lineWidth: 2,
                                    stroke: '#d63031'
                                },
                                z: 500,
                                invisible: visible,
                                draggable: true,
                                ondrag: (param) => {
                                    let offsetX = param.offsetX;
                                    let temp = this.lastPontList[value.index - 1];
                                    temp.thirdOffsetX = offsetX - point[1][0];
                                    this.lastPontList[value.index - 1] = temp;
                                    this.drawLableLineText([this.lastPontList[value.index - 1]], myChart);
                                }
                            }
                        ]
                    }
                });
            }
        },
        
        dragPointDataShow() {
            this.drawDragPointFirst(this.lastPontList, this.myChart, false);
            this.drawDragPointSecond(this.lastPontList, this.myChart, false);
            this.drawDragPointThird(this.lastPontList, this.myChart, false);
        },
        dragPointDatahide() {
            this.drawDragPointFirst(this.lastPontList, this.myChart, true);
            this.drawDragPointSecond(this.lastPontList, this.myChart, true);
            this.drawDragPointThird(this.lastPontList, this.myChart, true);
        }
    }
};
</script>
<style scoped>
.demo-drawer__footer {
    position: absolute;
    width: 100%;
    bottom: 10px;
    display: flex;
    justify-content: center;
}
</style>
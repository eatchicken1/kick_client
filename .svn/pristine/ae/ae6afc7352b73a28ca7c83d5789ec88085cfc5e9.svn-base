<template>
  <el-card class="box-card-container-vertical">
    <div id="horizontalprojection" style="height: 700px; width: 800px"></div>
  </el-card>
</template>
<script>
import { getHorizontalData } from "../../../api/index";
const eye = require("@/assets/icon/eye-regular.svg");
const eyeslash = require("@/assets/icon/eye-slash-regular.svg");
const toggleOff = require("@/assets/icon/toggle-off-solid.svg");
const toggleOn = require("@/assets/icon/toggle-on-solid.svg");
export default {
  name: "HorizontalProjection",
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      myChart: {},
      option: {},
      divDom: {},
      // 主刻度长度
      tickLen: 400,
      // 次刻度个数
      splitNumber: 5,
      // 以此数值为基准，确保坐标轴长度足够
      widthFeed: 1000,
      // 拖拽点的显示
      dragVisible: false,
      labelShow: false,
      // 标签参数
      labelParam: {
        height: 30,
        width: 20,
        len: 60,
      },
      horizontalData: {},
      dragPointData: [],
      finalAxis: 0,
      xAxisMin: 0,
    };
  },
  watch: {
    data(val, oldVal) {
      if (typeof val != "undefined") {
        console.log(val);
        this.horizontalprojection();
      }
    },
  },
  methods: {
    horizontalprojection() {
      this.myChart = this.$echarts.init(
        document.getElementById("horizontalprojection")
      );
      if (typeof this.data != "undefined") {
        this.horizontalData = this.data;
        this.initChart(this.data, this.config);
      }
    },

    // 初始化图表
    initChart(res, config) {
      this.horizontalData = res;
      let { yMax, yMin, xMax, xMin } = this.horizontalData;
      let xAxisMin = xMax;
      let xAxisMax = xMin;
      let heightMin = yMin;
      let heightMax = yMax;

      let { tickLen, splitNumber, widthFeed } = this;
      if (config) {
        if (config.tickLen) tickLen = config.tickLen;
        if (config.splitNumber) splitNumber = config.splitNumber;
        if (config.widthFeed) widthFeed = config.widthFeed;
      }
      let xAxisMinFeed = Math.ceil(Math.abs(xAxisMin) / widthFeed);
      let xAxisMaxFeed = Math.ceil(xAxisMax / widthFeed);
      let heightMaxFeed = Math.ceil(heightMax / widthFeed);
      let heightMinFeed = Math.ceil(Math.abs(heightMin) / widthFeed);

      // 确定坐标轴长度
      xAxisMax = xAxisMaxFeed * widthFeed;
      heightMax = heightMaxFeed * widthFeed;

      if (xAxisMin < 0) {
        xAxisMin = -xAxisMinFeed * widthFeed;
      } else {
        xAxisMin = 0;
      }
      if (heightMin < 0) {
        heightMin = -heightMinFeed * widthFeed;
      } else {
        heightMin = 0;
      }
      // 取两坐标轴得最大值作为最终得横纵坐标
      let finalAxis = Math.max(heightMax - heightMin, xAxisMax - xAxisMin);
      this.finalAxis = finalAxis;
      this.xAxisMin = xAxisMin;

      let axisMin = Math.min(xAxisMin, heightMin);
      let axisMax = Math.max(xAxisMax, heightMax);

      let temp = Math.max(Math.abs(axisMin), Math.abs(axisMax));
      axisMax = temp;
      axisMin = -temp;
      tickLen = temp / 5;
      console.log();
      // 绘制坐标轴相关
      this.option = {
        // animation: true,
        legend: {},
        grid: {
          top: 50,
          left: 100,
          right: 100,
          bottom: 50,
        },
        xAxis: {
          name: "西(-)东(+)[m]",
          nameGap: 30,
          nameLocation: "middle",
          nameTextStyle: {
            fontSize: 15,
          },
          interval: tickLen,
          min: axisMin,
          max: axisMax,
          minorTick: {
            show: true,
            splitNumber: splitNumber,
            length: 4,
          },
          axisTick: {
            length: 6,
            lineStyle: {
              width: 1,
            },
          },
          axisLine: {
            onZero: true,
            lineStyle: {
              width: 2,
            },
          },
          splitLine: {
            lineStyle: {
              color: "#999",
            },
          },
          minorSplitLine: {
            show: true,
            lineStyle: {
              color: "#ddd",
            },
          },
        },
        yAxis: {
          name: "南(-)北(+)[m]",
          nameGap: 50,
          nameLocation: "middle",
          nameTextStyle: {
            fontSize: 15,
          },
          interval: tickLen,
          min: axisMin,
          max: axisMax,
          minorTick: {
            show: true,
            splitNumber: splitNumber,
            length: 4,
          },
          axisTick: {
            length: 6,
            lineStyle: {
              width: 1,
            },
          },
          axisLine: {
            onZero: true,
            lineStyle: {
              width: 2,
            },
          },
          splitLine: {
            lineStyle: {
              color: "#999",
            },
          },
          minorSplitLine: {
            show: true,
            lineStyle: {
              color: "#ddd",
            },
          },
        },
        dataZoom: [
          {
            xAxisIndex: [0],
            show: true,
            type: "inside",
            filterMode: "filter",
          },
          {
            yAxisIndex: [0],
            show: true,
            type: "inside",
            filterMode: "filter",
          },
        ],
        toolbox: {
          show: true,
          emphasis: {
            iconStyle: {
              textPosition: "top",
            },
          },
          feature: {
            myArea: {
              show: true,
              title: "显示靶区",
              icon: "image://" + toggleOff,
              onclick: (param, api, name, event) => {
                let feature = this.option.toolbox.feature;
                if (feature.myArea.title == "显示靶区") {
                  feature.myArea.title = "隐藏靶区";
                  feature.myArea.icon = "image://" + toggleOn;
                } else {
                  feature.myArea.title = "显示靶区";
                  feature.myArea.icon = "image://" + toggleOff;
                }
                this.option.toolbox.feature = feature;
                this.myChart.setOption({
                  toolbox: {
                    feature: feature,
                  },
                });
              },
            },
            myTags: {
              show: true,
              title: "显示标注",
              icon: "image://" + toggleOff,
              onclick: (param, api, name, event) => {
                let feature = this.option.toolbox.feature;
                if (feature.myTags.title == "显示标注") {
                  feature.myTags.title = "隐藏标注";
                  feature.myTags.icon = "image://" + toggleOn;
                  this.showLabel();
                } else {
                  feature.myTags.title = "显示标注";
                  feature.myTags.icon = "image://" + toggleOff;
                  this.hideLabel();
                }
                this.option.toolbox.feature = feature;
                this.myChart.setOption({
                  toolbox: {
                    feature: feature,
                  },
                });
              },
            },
            myIsEdit: {
              show: true,
              title: "显示拖拽点",
              icon: "image://" + eye,
              onclick: (param, api, name, event) => {
                // console.log(param, api, name, event);
                let feature = this.option.toolbox.feature;
                if (feature.myIsEdit.title == "显示拖拽点") {
                  if (!this.labelShow) {
                    this.$message({
                      type: "warning",
                      message: "请先开启标注显示",
                    });
                    return;
                  }
                  feature.myIsEdit.title = "隐藏拖拽点";
                  feature.myIsEdit.icon = "image://" + eyeslash;
                  this.dragPointDataShow();
                } else {
                  feature.myIsEdit.title = "显示拖拽点";
                  feature.myIsEdit.icon = "image://" + eye;
                  this.dragPointDatahide();
                }
                this.option.toolbox.feature = feature;
                this.myChart.setOption({
                  toolbox: {
                    feature: feature,
                  },
                });
              },
            },
            saveAsImage: {
              name: "垂直投影",
            },
          },
          right: 100,
          top: 13,
        },
      };
      this.myChart.setOption(this.option);
      // 曲线
      res.data.forEach((drawData, index) => {
        console.log(drawData);
        this.myChart.setOption({
          series: [
            {
              name: drawData.name,
              id: "vertical" + index,
              type: "line",
              showSymbol: false,
              itemStyle: {
                color: drawData.color,
              },
              data: drawData.data,
              z: 10,
            },
          ],
        });
      });
      this.myChart.on("datazoom", (param) => {
        // console.log(param);
        if (this.labelShow) {
          this.drawKeyPoints(
            res.keypoints,
            this.myChart,
            !this.dragVisible,
            true
          );
        }
      });
    },
    dragPointDataShow() {
      this.drawKeyPoints(this.horizontalData.keypoints, this.myChart, false);
      this.dragVisible = true;
    },
    dragPointDatahide() {
      this.horizontalData.keypoints.forEach((value, index) => {
        this.myChart.setOption({
          graphic: [
            {
              id: "dragCircle" + index,
              $action: "remove",
            },
          ],
        });
      });
      this.dragVisible = false;
    },
    showLabel() {
      this.drawKeyPoints(
        this.horizontalData.keypoints,
        this.myChart,
        !this.dragVisible
      );
      this.labelShow = true;
    },
    hideLabel() {
      this.labelRemove(
        this.horizontalData.keypoints.map((value, index) => index),
        this.myChart
      );
      this.labelShow = false;
    },
    labelRemove(indexs, myChart) {
      indexs.forEach((value) => {
        myChart.setOption({
          graphic: [
            {
              id: "dragCircle" + value,
              $action: "remove",
            },
            {
              id: "point" + value,
              $action: "remove",
            },
            {
              id: "line" + value,
              $action: "remove",
            },
            {
              id: "text" + value,
              $action: "remove",
            },
          ],
        });
      });
    },
    drawKeyPoints(keypoints, myChart, drag = true, outOrIn) {
      let renderArr = [];
      let zeroPx = myChart.convertToPixel({ gridIndex: 0 }, [0, 0]);
      let idNumber = null;
      if (!Array.isArray(keypoints)) {
        idNumber = keypoints.index;
        keypoints = [keypoints.value];
      }
      keypoints.forEach((value, index) => {
        if (idNumber) index = idNumber;
        const { x, y, x1, y1, name } = value;
        // 关键点
        let point = myChart.convertToPixel({ gridIndex: 0 }, [x, y]);
        let point1 = [];
        if (x1 && y1) {
          point1 = myChart.convertToPixel({ gridIndex: 0 }, [x1, y1]);
        } else {
          const { width, height } = this.labelParam;
          point1 = [point[0] + width, point[1] - height];
          let isPointInGrid = myChart.containPixel({ gridIndex: 0 }, point1);
          if (!isPointInGrid) {
               point1 = [point[0] + width, point[1] + height];
               isPointInGrid = myChart.containPixel({ gridIndex: 0 }, point1);
               if (!isPointInGrid) {
                    point1 = [point[0] - width, point[1] + height];
                    isPointInGrid = myChart.containPixel({ gridIndex: 0 }, point1);
                    if (!isPointInGrid) {
                         point1 = [point[0] - width, point[1] - height];
                    }
               }
          }

        }

        if (outOrIn) {
          const isPointInGrid = myChart.containPixel({ gridIndex: 0 }, point);
          const isPoint1InGrid = myChart.containPixel({ gridIndex: 0 }, point1);
          if (!isPointInGrid || !isPoint1InGrid) {
            this.labelRemove([index], myChart);
            return false;
          }
        }

        let circle = {
          type: "circle",
          id: "point" + index,
          shape: {
            cx: point[0],
            cy: point[1],
            r: 3,
          },
          style: {
            fill: "black",
            lineWidth: 1,
            stroke: "#2c3e50",
          },
        };
        // 标注线

        let labelLine = {
          type: "polyline",
          id: "line" + index,
          shape: {
            smooth: 0,
            points: [[...point], [...point1]],
          },
          style: {
            fill: null,
            stroke: "black",
          },
        };
        // 文字的位置
        let textHeight = [point1[0], point1[1]];
        let textAlign = "center";
        if (point1[0] > point[0]) {
          textAlign = "left";
        }
        if (point1[0] < point[0]) {
          textAlign = "right";
        }
        let textName = {
          type: "text",
          id: "text" + index,
          style: {
            x: point1[0],
            y: textHeight[1],
            text: name,
            stroke: "black",
            font: '12px "STHeiti", sans-serif',
            textAlign: textAlign,
            textVerticalAlign: "middle",
          },
        };
        // 拖拽点
        let dragPoint = {
          type: "circle",
          id: "dragCircle" + index,
          position: point1,
          shape: {
            cx: 0,
            cy: 0,
            r: 5,
          },

          style: {
            fill: "#ffffff",
            stroke: "#e74c3c",
            lineWidth: 2,
          },
          draggable: true,
          ondrag: (param) => {
            // console.log(param);
            const isPointInGrid = myChart.containPixel({ gridIndex: 0 }, [
              param.offsetX,
              param.offsetY,
            ]);
            if (!isPointInGrid) {
              let pointInfo = this.horizontalData.keypoints[index];
              let lastPoint = myChart.convertToPixel({ gridIndex: 0 }, [
                pointInfo.x1,
                pointInfo.y1,
              ]);
              myChart.setOption({
                graphic: [
                  {
                    id: "dragCircle" + index,
                    position: lastPoint,
                  },
                ],
              });
              return false;
            } else {
              myChart.setOption({
                graphic: [
                  {
                    id: "dragCircle" + index,
                    position: [param.offsetX, param.offsetY],
                  },
                ],
              });
            }
            let movePoint = this.myChart.convertFromPixel("grid", [
              param.offsetX,
              param.offsetY,
            ]);
            let temp = Object.assign(
              { ...value },
              { x1: movePoint[0], y1: movePoint[1] }
            );
            this.horizontalData.keypoints[index] = temp;
            this.drawKeyPoints(
              {
                value: temp,
                index: index,
              },
              myChart,
              true
            );
          },
          z: 100,
        };
        renderArr.push(circle);
        renderArr.push(labelLine);
        renderArr.push(textName);
        if (!drag) {
          renderArr.push(dragPoint);
        }
      });
      myChart.setOption({
        graphic: renderArr,
      });
    },
  },
};
</script>
<style >
.box-card-container-vertical {
  display: flex;
  justify-content: start;
}
</style>
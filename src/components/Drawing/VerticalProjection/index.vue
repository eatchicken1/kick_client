<template>
  <el-card class="box-card-container-vertical">
    <div id="verticalProjection" style="height: 700px; width: 800px"></div>
  </el-card>
</template>
<script>
import { max } from "moment";
import { getVerticalData } from "../../../api/index";
const eye = require("@/assets/icon/eye-regular.svg");
const eyeslash = require("@/assets/icon/eye-slash-regular.svg");
const toggleOff = require("@/assets/icon/toggle-off-solid.svg");
const toggleOn = require("@/assets/icon/toggle-on-solid.svg");
export default {
  name: "VerticalProjection",
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
      widthFeed: 400,
      // 拖拽点的显示
      dragVisible: false,
      labelShow: false,
      // 标签参数
      labelParam: {
        height: 30,
        width: 20,
        len: 60,
      },
      verticalData: {},
      dragPointData: [],
      finalAxis: 0,
      xAxisMin: 0,
    };
  },
  mounted() {
    // this.drawHorizontalProjection();
  },
  watch: {
    data(val, oldVal) {
      if (typeof val != "undefined") {
        this.verticalProjection();
      }
    },
  },
  methods: {
    verticalProjection() {
      this.myChart = this.$echarts.init(
        document.getElementById("verticalProjection")
      );
      if (typeof this.data != "undefined") {
        this.verticalData = this.data;
        this.initChart(this.data);
      } else {
        // 默认数据请求
        getVerticalData().then((res) => {
          this.initChart(res);
        });
      }
      // 数据请求
    },
    initChart(res, config) {
      this.verticalData = res;
      let { xMin, xMax, yMax } = this.verticalData;
      let xAxisMin = xMin;
      let xAxisMax = xMax;
      let heightMax = yMax;
      let { tickLen, splitNumber, widthFeed } = this;
      let maxLen = Math.max(Math.abs(xAxisMin) + Math.abs(xAxisMax), heightMax);
      let axisLen = Math.ceil(maxLen / 1000) * 1000;
      console.log(axisLen);
      tickLen = axisLen / 10;

      // 取两坐标轴得最大值作为最终得横纵坐标
      let finalAxis = axisLen;
      this.finalAxis = finalAxis;
      this.xAxisMin = xAxisMin;
      this.xAxisMax = xAxisMax;
      let xLenAbs = Math.abs(xAxisMax) + Math.abs(xAxisMin);
      let num = Math.ceil(xLenAbs / tickLen);
      let left = Math.floor((10 - num) / 2);
      let right = 10 - left;
      xAxisMin = -(left * tickLen);
      xAxisMax = right * tickLen;
      this.xAxisMin = xAxisMin;
      this.xAxisMax = xAxisMax;
      this.option = {
        // animation: false,
        legend: {},
        // color: ["red","blue"],
        grid: {
          top: 50,
          left: 100,
          right: 100,
          bottom: 50,
        },
        xAxis: {
          name: "视平移[m]",
          nameGap: 30,
          nameLocation: "middle",
          nameTextStyle: {
            fontSize: 15,
          },
          interval: tickLen,
          min: xAxisMin,
          max: xAxisMax,
          minorTick: {
            show: true,
            splitNumber: splitNumber,
            length: 4,
          },
          axisLine: {
            lineStyle: {
              width: 2,
            },
          },
          axisTick: {
            length: 6,
            lineStyle: {
              width: 1,
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
          name: "垂深[m]",
          nameGap: 50,
          nameLocation: "middle",
          nameTextStyle: {
            fontSize: 15,
          },
          interval: tickLen,
          max: finalAxis,
          inverse: true,
          minorTick: {
            show: true,
            splitNumber: splitNumber,
            length: 4,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              width: 2,
            },
          },
          axisTick: {
            length: 6,
            lineStyle: {
              width: 1,
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
        //console.log(drawData)
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

      // 缩放事件
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
      this.drawKeyPoints(this.verticalData.keypoints, this.myChart, false);
      this.dragVisible = true;
    },
    dragPointDatahide() {
      this.verticalData.keypoints.forEach((value, index) => {
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
        this.verticalData.keypoints,
        this.myChart,
        !this.dragVisible
      );
      this.labelShow = true;
    },
    hideLabel() {
      this.labelRemove(
        this.verticalData.keypoints.map((value, index) => index),
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
          if (point[1] - height > zeroPx[1]) {
            point1 = [point[0] + width, point[1] - height];
          } else {
            point1 = [point[0] + width, point[1] + height];
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
              let pointInfo = this.verticalData.keypoints[index];
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
            this.verticalData.keypoints[index] = temp;
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
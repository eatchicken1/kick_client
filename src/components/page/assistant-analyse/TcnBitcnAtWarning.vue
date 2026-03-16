<template>
  <div class="warning-container">
    <div class="header-section">
      <div class="well-selector">
        <span class="selector-label">当前监控井：</span>
        <el-radio-group v-model="currentWell" @change="handleWellChange" size="medium">
          <el-radio-button label="W1">W1井 (19:47预警，存在19:05接单根干扰)</el-radio-button>
          <el-radio-button label="W2">W2井 (13:27预警，存在13:16传感器漂移干扰)</el-radio-button>
        </el-radio-group>
      </div>
      <el-button type="danger" icon="el-icon-data-analysis" @click="openShapModal">
        查看 SHAP 智能可解释性分析
      </el-button>
    </div>

    <el-card shadow="hover" class="chart-card">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; font-size: 16px;">
          {{ currentWell }}井 - 综合录井数据及预测概率 (TCN-BiGRU-AT模型)
        </span>
      </div>
      <div ref="mainLogChart" class="main-log-chart"></div>
    </el-card>

    <el-dialog
      :title="`模型预测依据与可解释性分析`"
      :visible.sync="shapDialogVisible"
      width="90%"
      top="3vh"
      @opened="handleShapOpened"
      center
    >
      <el-tabs v-model="activeShapTab" @tab-click="handleTabClick">
        <el-tab-pane label="SHAP 摘要图 (全局特征重要性)" name="summary">
          <div class="shap-desc">
            <i class="el-icon-s-marketing"></i> <strong>全局解释：</strong>
            大钩载荷(HL)与立管压力(SPP)构成核心判别指标。HL升高与SPP下降展现出最强的预警时效性。
          </div>
          <div ref="shapSummaryChart" class="chart-box-modal"></div>
        </el-tab-pane>

        <el-tab-pane label="SHAP 全局特征交互影响" name="global-interaction">
          <div class="shap-desc">
            <i class="el-icon-s-grid"></i> <strong>全局交互：</strong>
            展示总体数据特征间的协同影响，两边突出的数据点表示其协同影响越大。
          </div>
          <div ref="shapGlobalInteractionChart" class="chart-box-modal" style="height: 600px;"></div>
        </el-tab-pane>

        <el-tab-pane :label="`${currentWell}井 SHAP 依赖与交互图`" name="local-interaction">
          <div class="shap-desc">
            <i class="el-icon-share"></i> <strong>局部解释：</strong>
            <span v-if="currentWell === 'W1'">
              19:47预警诊断：HL突增同时DT锐减产生正向交互；TQ下降与SPP下降形成负向耦合。成功排除了19:05接单根造成的HL单一波动干扰。
            </span>
            <span v-else>
              13:27预警诊断：捕捉到TPV微弱上升，且SPP、OFR与TPV形成显著负向耦合。成功排除了13:16压力传感器瞬时漂移的干扰。
            </span>
          </div>
          <div ref="shapLocalInteractionChart" class="chart-box-modal" style="height: 500px;"></div>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="shapDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'TcnBitcnAtWarning',
  data() {
    return {
      currentWell: 'W1',
      mainLogChartInstance: null,
      shapSummaryChartInstance: null,
      shapGlobalInteractionChartInstance: null,
      shapLocalInteractionChartInstance: null,
      shapDialogVisible: false,
      activeShapTab: 'summary',
      
      // 生成的仿真时序数据
      w1Data: null,
      w2Data: null,
    };
  },
  mounted() {
    this.generateSimulationData();
    this.renderMainLogChart();
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
    this.disposeAllCharts();
  },
  methods: {
    // 算法生成高频仿真录井数据
    generateSimulationData() {
      const w1 = { times: [], hl: [], dt: [], tq: [], spp: [], ofr: [], tpv: [], pred: [] };
      let timeBase = new Date('2024-01-01T17:53:00');
      for (let i = 0; i < 138; i++) {
        w1.times.push(timeBase.toTimeString().substring(0, 5));
        timeBase.setMinutes(timeBase.getMinutes() + 1);
        
        let noise = () => (Math.random() - 0.5);
        let hl = 920 + noise() * 15;
        let dt = 3.5 + noise() * 0.5;
        let tq = 6.6 + noise() * 1.5;
        let spp = 25.5 + noise() * 0.8;
        let ofr = 37 + noise() * 2;
        let tpv = 129.5 + noise() * 0.3;
        let pred = Math.abs(noise() * 0.05);

        if (i > 65 && i < 78) {
          hl = 1000 + noise() * 20;
          spp = 24.0 + noise() * 0.8;
          tpv = 128.8 + noise() * 0.2;
          pred = 0.3 + Math.abs(noise() * 0.2); 
        }
        
        if (i >= 114) {
          hl = 1000 + noise() * 15;
          dt = 2.9 + noise() * 0.2;
          tq = 5.0 + noise() * 0.8;
          spp = 25.0 + noise() * 0.5;
          pred = 0.95 + noise() * 0.04;
          if (i > 125) { 
            ofr = 37 + Math.pow(i - 125, 1.2);
            tpv = 129.5 + Math.pow(i - 125, 0.8) * 0.1;
          }
        }
        w1.hl.push(hl); w1.dt.push(dt); w1.tq.push(tq); w1.spp.push(spp); 
        w1.ofr.push(ofr); w1.tpv.push(tpv); w1.pred.push(pred);
      }
      this.w1Data = w1;

      const w2 = { times: [], hl: [], spp: [], ofr: [], tpv: [], pred: [] };
      timeBase = new Date('2024-01-01T12:17:00');
      for (let i = 0; i < 101; i++) {
        w2.times.push(timeBase.toTimeString().substring(0, 5));
        timeBase.setMinutes(timeBase.getMinutes() + 1);
        let noise = () => (Math.random() - 0.5);
        
        let hl = 1216 + noise() * 8;
        let spp = 20.2 + noise() * 0.3;
        let ofr = 58 + noise() * 2 + (i * 0.05);
        let tpv = 127.5 - (i * 0.01) + noise() * 0.5;
        let pred = Math.abs(noise() * 0.05);

        if (i > 56 && i < 62) {
          spp = 19.0 + noise() * 0.5;
          ofr = 56 + noise() * 3;
          tpv = 126.2 + noise() * 0.5;
          pred = 0.2 + Math.abs(noise() * 0.2); 
        }
        
        if (i >= 70) {
          hl = 1235 + noise() * 10 + (i - 70) * 0.2;
          spp = 19.1 + noise() * 0.4;
          ofr = 60 + noise() * 1 + (i - 70) * 0.1;
          tpv = 126.8 + noise() * 0.2 + Math.pow(i - 70, 1.1) * 0.08;
          pred = 0.96 + noise() * 0.03;
        }
        w2.hl.push(hl); w2.spp.push(spp); w2.ofr.push(ofr); w2.tpv.push(tpv); w2.pred.push(pred);
      }
      this.w2Data = w2;
    },

    handleWellChange() {
      this.renderMainLogChart();
      if (this.shapDialogVisible) {
        this.renderActiveShapChart();
      }
    },

    // 渲染堆叠式的综合录井数据曲线 
    renderMainLogChart() {
      const chartDom = this.$refs.mainLogChart;
      if (!this.mainLogChartInstance) this.mainLogChartInstance = echarts.init(chartDom);
      
      const isW1 = this.currentWell === 'W1';
      const data = isW1 ? this.w1Data : this.w2Data;
      
      const grids = [];
      const yAxes = [];
      const series = [];
      const titles = isW1 ? ['HL (kN)', 'DT (min/m)', 'TQ (kN·m)', 'SPP (MPa)', 'OFR (L/s)', 'TPV (m³)', 'Predicted'] 
                          : ['HL (kN)', 'SPP (MPa)', 'OFR (L/s)', 'TPV (m³)', 'Predicted'];
      const colors = ['#f47a20', '#636b8e', '#885566', '#5b82a3', '#a7af69', '#008b8b', '#481d68'];
      
      const gridCount = titles.length;
      const heightPercent = Math.floor(82 / gridCount); 

      titles.forEach((title, index) => {
        grids.push({
          top: `${4 + index * (heightPercent + 2)}%`,
          height: `${heightPercent}%`,
          left: '10%', right: '5%' // 左侧加大一点防止 y 轴标签被遮盖
        });
        
        yAxes.push({
          gridIndex: index,
          type: 'value',
          name: title,
          nameLocation: 'middle',
          nameGap: 40,
          splitLine: { show: false },
          axisLabel: { fontSize: 11 },
          scale: true
        });
        
        const isLast = index === gridCount - 1;
        let seriesData = [];
        if (title.includes('HL')) seriesData = data.hl;
        if (title.includes('DT')) seriesData = data.dt;
        if (title.includes('TQ')) seriesData = data.tq;
        if (title.includes('SPP')) seriesData = data.spp;
        if (title.includes('OFR')) seriesData = data.ofr;
        if (title.includes('TPV')) seriesData = data.tpv;
        if (title.includes('Predicted')) seriesData = data.pred;

        series.push({
          name: title.split(' ')[0],
          type: 'line',
          xAxisIndex: index,
          yAxisIndex: index,
          data: seriesData,
          showSymbol: false,
          lineStyle: { color: colors[index], width: 1.5 },
          markArea: isLast ? {
            itemStyle: { color: 'rgba(255, 173, 177, 0.4)' },
            data: [
              [
                { xAxis: isW1 ? '19:47' : '13:27', name: '预警发生' },
                { xAxis: isW1 ? '20:07' : '13:41' }
              ]
            ]
          } : null,
          markLine: isLast ? {
            lineStyle: { color: 'red', type: 'dashed' },
            data: [{ xAxis: isW1 ? '19:47' : '13:27' }]
          } : null
        });
      });

      // 优化点：统一绘制横坐标轴线（起分割作用），但仅在最底部展示坐标时间标注
      const xAxes = titles.map((_, index) => {
        const isLast = index === gridCount - 1;
        return {
          gridIndex: index,
          type: 'category',
          data: data.times,
          show: true, 
          axisLine: { show: true, lineStyle: { color: '#ccc' } },
          axisTick: { show: isLast },
          axisLabel: { 
            show: isLast, 
            interval: Math.floor(data.times.length / 10), 
            rotate: 45 
          }
        };
      });

      const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
        grid: grids,
        xAxis: xAxes,
        yAxis: yAxes,
        series: series,
        backgroundColor: '#f9f9f9'
      };

      this.mainLogChartInstance.setOption(option, true);
    },

    openShapModal() {
      this.shapDialogVisible = true;
      this.activeShapTab = 'summary';
    },

    handleShapOpened() {
      this.renderActiveShapChart();
    },

    handleTabClick() {
      this.renderActiveShapChart();
    },

    renderActiveShapChart() {
      this.$nextTick(() => {
        if (this.activeShapTab === 'summary') this.renderShapSummaryChart();
        else if (this.activeShapTab === 'global-interaction') this.renderShapGlobalInteractionChart();
        else if (this.activeShapTab === 'local-interaction') this.renderShapLocalInteractionChart();
      });
    },

    renderShapSummaryChart() {
      const chartDom = this.$refs.shapSummaryChart;
      if (!this.shapSummaryChartInstance) this.shapSummaryChartInstance = echarts.init(chartDom);
      
      const features = ['Hook Load', 'Standpipe Pressure', 'Outlet Flow Rate', 'Torque', 'Drilling Time', 'Total Hydrocarbon', 'Total Pool Volume', 'Outlet Density'];
      const values = [2.5, 1.8, 1.4, 0.9, 0.8, 0.6, 0.5, 0.2];

      const option = {
        title: { text: 'Mean |SHAP value| (Average impact on model output magnitude)', left: 'center', bottom: 10, textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '20%', right: '10%', top: '10%', bottom: '15%' },
        xAxis: { type: 'value', splitLine: { show: false } },
        yAxis: { type: 'category', data: features.reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontWeight: 'bold' } },
        series: [{
          type: 'bar',
          data: values.reverse(),
          itemStyle: { color: '#ff0051' },
          barWidth: '50%'
        }]
      };
      this.shapSummaryChartInstance.setOption(option, true);
    },

    renderShapGlobalInteractionChart() {
      const chartDom = this.$refs.shapGlobalInteractionChart;
      if (!this.shapGlobalInteractionChartInstance) this.shapGlobalInteractionChartInstance = echarts.init(chartDom);
      
      const generateMatrixData = () => {
        let res = [];
        for(let i=0; i<150; i++) {
          let x = (Math.random() - 0.5) * 5;
          let y = (Math.random() - 0.5) * (3 - Math.abs(x)*0.5);
          res.push([x, y]);
        }
        return res;
      };

      const option = {
        title: { text: 'SHAP Feature Interaction Matrix', left: 'center' },
        grid: [
          { top: '15%', height: '30%', width: '40%', left: '5%' },
          { top: '15%', height: '30%', width: '40%', left: '55%' },
          { top: '60%', height: '30%', width: '40%', left: '5%' },
          { top: '60%', height: '30%', width: '40%', left: '55%' }
        ],
        xAxis: [
          { gridIndex: 0, name: 'HL vs SPP', nameLocation: 'middle', nameGap: 25 },
          { gridIndex: 1, name: 'HL vs DT', nameLocation: 'middle', nameGap: 25 },
          { gridIndex: 2, name: 'SPP vs TQ', nameLocation: 'middle', nameGap: 25 },
          { gridIndex: 3, name: 'OFR vs TPV', nameLocation: 'middle', nameGap: 25 }
        ],
        yAxis: [
          { gridIndex: 0, show: false }, { gridIndex: 1, show: false },
          { gridIndex: 2, show: false }, { gridIndex: 3, show: false }
        ],
        series: [
          { type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: generateMatrixData(), itemStyle: { color: '#0052d4' }, symbolSize: 4 },
          { type: 'scatter', xAxisIndex: 1, yAxisIndex: 1, data: generateMatrixData(), itemStyle: { color: '#e53935' }, symbolSize: 4 },
          { type: 'scatter', xAxisIndex: 2, yAxisIndex: 2, data: generateMatrixData(), itemStyle: { color: '#8e44ad' }, symbolSize: 4 },
          { type: 'scatter', xAxisIndex: 3, yAxisIndex: 3, data: generateMatrixData(), itemStyle: { color: '#f39c12' }, symbolSize: 4 }
        ]
      };
      this.shapGlobalInteractionChartInstance.setOption(option, true);
    },

    // 重点修改区域：只更新了W1和W2的交互图逻辑
    renderShapLocalInteractionChart() {
      const chartDom = this.$refs.shapLocalInteractionChart;
      if (!this.shapLocalInteractionChartInstance) this.shapLocalInteractionChartInstance = echarts.init(chartDom);
      
      let option = {};
      
      if (this.currentWell === 'W1') {
        const genW1Spp = () => {
          let res = [];
          for(let i=0; i<300; i++) {
            let x = 24.0 + Math.random() * 3.5; 
            let y = 0.5 - ((x - 24.0) / 3.5) * 1.2 + (Math.random()-0.5)*0.3; 
            let c = 4 + Math.random() * 4; 
            res.push([x, y, c]);
          }
          return res;
        };

        const genW1Hl = () => {
          let res = [];
          for(let i=0; i<300; i++) {
            let isHigh = Math.random() > 0.45;
            let x, y, c;
            if(isHigh) {
              x = 960 + Math.random() * 60; 
              y = 5 + Math.random() * 4; 
              c = 3.5 + Math.random() * 1.5; 
            } else {
              x = 920 + Math.random() * 40; 
              y = -3 + Math.random() * 3; 
              c = 3.0 + Math.random() * 2.0; 
            }
            res.push([x, y, c]);
          }
          return res;
        };

        option = {
          title: [
            { text: 'SPP vs SHAP (Color: Torque)', left: '22%', top: '2%', textAlign: 'center', textStyle: { fontSize: 14 } },
            { text: 'HL vs SHAP (Color: Drilling Time)', left: '72%', top: '2%', textAlign: 'center', textStyle: { fontSize: 14 } }
          ],
          grid: [
            { left: '8%', width: '32%', top: '15%', bottom: '15%' }, 
            { left: '58%', width: '32%', top: '15%', bottom: '15%' }
          ],
          xAxis: [
            { gridIndex: 0, name: 'Standpipe Pressure', nameLocation: 'middle', nameGap: 30, scale: true }, 
            { gridIndex: 1, name: 'Hook Load', nameLocation: 'middle', nameGap: 30, scale: true }
          ],
          yAxis: [
            { gridIndex: 0, name: 'SHAP value', min: -0.8, max: 0.8 }, 
            { gridIndex: 1, name: 'SHAP value', min: -4, max: 10 }
          ],
          visualMap: [
            { seriesIndex: 0, min: 4, max: 8, left: '42%', top: 'center', text: ['Torque', ''], calculable: true, inRange: { color: ['#64b5f6', '#ffb74d', '#e57373'] } },
            { seriesIndex: 1, min: 3, max: 5, left: '92%', top: 'center', text: ['DT', ''], calculable: true, inRange: { color: ['#64b5f6', '#ffb74d', '#e57373'] } }
          ],
          series: [
            { type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: genW1Spp(), symbolSize: 5, itemStyle: { opacity: 0.7 } },
            { type: 'scatter', xAxisIndex: 1, yAxisIndex: 1, data: genW1Hl(), symbolSize: 5, itemStyle: { opacity: 0.7 } }
          ]
        };
      } else {
        const genW2Spp = () => {
          let res = [];
          for(let i=0; i<300; i++) {
            let x = 18.5 + Math.random() * 3.0; 
            let y, c;
            if (x < 19.8) {
              y = 6 + Math.random() * 2; 
              c = 60 + Math.random() * 5; 
            } else if (x > 20.2) {
              y = -5 + Math.random() * 2; 
              c = 45 + Math.random() * 10; 
            } else {
              y = -5 + ((19.8 - x) / -0.4) * 11 + (Math.random()-0.5)*1;
              c = 55 + (Math.random()-0.5)*5;
            }
            res.push([x, y, c]);
          }
          return res;
        };

        const genW2Tpv = () => {
          let res = [];
          for(let i=0; i<300; i++) {
            let x = 124 + Math.random() * 8; 
            let y, c;
            if (x < 126.5) {
              y = -4 + Math.random() * 2; 
              c = 20.2 + Math.random() * 0.8; 
            } else if (x > 128) {
              y = 1 + Math.random() * 2; 
              c = 18.5 + Math.random() * 1.0; 
            } else {
              y = -4 + ((x - 126.5) / 1.5) * 5 + (Math.random()-0.5)*1;
              c = 19.5 + (Math.random()-0.5)*0.5;
            }
            res.push([x, y, c]);
          }
          return res;
        };

        option = {
          title: [
            { text: 'SPP vs SHAP (Color: OFR)', left: '22%', top: '2%', textAlign: 'center', textStyle: { fontSize: 14 } },
            { text: 'TPV vs SHAP (Color: SPP)', left: '72%', top: '2%', textAlign: 'center', textStyle: { fontSize: 14 } }
          ],
          grid: [
            { left: '8%', width: '32%', top: '15%', bottom: '15%' }, 
            { left: '58%', width: '32%', top: '15%', bottom: '15%' }
          ],
          xAxis: [
            { gridIndex: 0, name: 'Standpipe Pressure', nameLocation: 'middle', nameGap: 30, scale: true }, 
            { gridIndex: 1, name: 'Total Pool Volume', nameLocation: 'middle', nameGap: 30, scale: true }
          ],
          yAxis: [
            { gridIndex: 0, name: 'SHAP value', min: -6, max: 8 }, 
            { gridIndex: 1, name: 'SHAP value', min: -6, max: 3 }
          ],
          visualMap: [
            { seriesIndex: 0, min: 45, max: 65, left: '42%', top: 'center', text: ['OFR', ''], calculable: true, inRange: { color: ['#e57373', '#ffb74d', '#64b5f6'] } },
            { seriesIndex: 1, min: 18.5, max: 21, left: '92%', top: 'center', text: ['SPP', ''], calculable: true, inRange: { color: ['#e57373', '#ffb74d', '#64b5f6'] } }
          ],
          series: [
            { type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: genW2Spp(), symbolSize: 5, itemStyle: { opacity: 0.7 } },
            { type: 'scatter', xAxisIndex: 1, yAxisIndex: 1, data: genW2Tpv(), symbolSize: 5, itemStyle: { opacity: 0.7 } }
          ]
        };
      }
      this.shapLocalInteractionChartInstance.setOption(option, true);
    },

    resizeCharts() {
      if (this.mainLogChartInstance) this.mainLogChartInstance.resize();
      if (this.shapSummaryChartInstance) this.shapSummaryChartInstance.resize();
      if (this.shapGlobalInteractionChartInstance) this.shapGlobalInteractionChartInstance.resize();
      if (this.shapLocalInteractionChartInstance) this.shapLocalInteractionChartInstance.resize();
    },

    disposeAllCharts() {
      if (this.mainLogChartInstance) this.mainLogChartInstance.dispose();
      if (this.shapSummaryChartInstance) this.shapSummaryChartInstance.dispose();
      if (this.shapGlobalInteractionChartInstance) this.shapGlobalInteractionChartInstance.dispose();
      if (this.shapLocalInteractionChartInstance) this.shapLocalInteractionChartInstance.dispose();
    }
  }
};
</script>

<style scoped>
.warning-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.well-selector {
  display: flex;
  align-items: center;
}
.selector-label {
  font-size: 16px;
  font-weight: bold;
  margin-right: 15px;
  color: #303133;
}
.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}
.main-log-chart {
  width: 100%;
  height: 900px;
}
.chart-box-modal {
  width: 100%;
  height: 480px;
}
.shap-desc {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-left: 5px solid #ff0051;
  margin-bottom: 20px;
  color: #3c4043;
  font-size: 15px;
  line-height: 1.6;
  border-radius: 4px;
}
</style>
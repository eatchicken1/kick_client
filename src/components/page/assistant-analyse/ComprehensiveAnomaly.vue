<template>
  <div class="anomaly-container" ref="container">
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再进行综合溢流异常检测。
    </el-alert>

    <el-card class="box-card search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="small">
        <el-form-item label="当前井号">
          <el-tag type="info" size="medium" effect="dark">{{ currentWellId || '未选择' }}</el-tag>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            style="width: 360px;">
          </el-date-picker>
        </el-form-item>

        <el-collapse class="ptd-collapse" accordion>
          <el-collapse-item title="⚙️ 高级算法参数 (PTD & 动态MAD)" name="ptd">
            <el-form-item label="短窗">
              <el-input v-model.number="searchForm.shortWindow" placeholder="默认 10" style="width: 100px;" type="number" min="1" />
            </el-form-item>
            <el-form-item label="长窗">
              <el-input v-model.number="searchForm.longWindow" placeholder="默认 100" style="width: 100px;" type="number" min="1" />
            </el-form-item>
            <el-form-item label="MAD 窗口">
              <el-input v-model.number="searchForm.madWindow" placeholder="默认 500" style="width: 100px;" type="number" min="1" />
            </el-form-item>
            <el-form-item label="K 系数">
              <el-input v-model.number="searchForm.kFactor" placeholder="默认 2.0" style="width: 100px;" type="number" step="0.1" />
            </el-form-item>
            <div class="ptd-hint">注：基于《深井超深井溢流早期风险评估方法研究》机理，推荐默认参数为：短窗10, 长窗100, MAD=500, K=2.0</div>
          </el-collapse-item>
        </el-collapse>

        <el-form-item style="margin-top: 10px;">
          <el-button type="primary" icon="el-icon-odometer" @click="fetchData" :loading="loading" :disabled="!currentWellId">
            启动 PTD 机理协同深度分析
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="15" class="dashboard-panel" v-if="hasData">
      <el-col :span="8">
        <div class="status-card" :class="globalStatus === 'danger' ? 'danger-bg' : 'safe-bg'">
          <div class="status-icon">
            <i :class="globalStatus === 'danger' ? 'el-icon-warning' : 'el-icon-success'"></i>
          </div>
          <div class="status-info">
            <div class="status-title">综合预警状态</div>
            <div class="status-text">{{ globalStatus === 'danger' ? '⚠️ 发现高风险溢流异常！' : '✅ 井筒压力平衡状态平稳' }}</div>
            <div class="status-mechanism" v-if="globalStatus === 'danger'">
              触发机理: <strong>立压异常下降</strong> 且 <strong>流量/池体积异常上升</strong>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never" class="stats-card">
          <div slot="header" class="clearfix">
            <span>📊 核心检测参数统计摘要 (算法突破点数 / 占比)</span>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">立压 (SPP) 异常:</span>
              <span class="value" :class="{'text-danger': stats.sppAnomalies > 0}">{{ stats.sppAnomalies }} 点 ({{ stats.sppRate }}%)</span>
            </div>
            <div class="stat-item">
              <span class="label">出口流量异常:</span>
              <span class="value" :class="{'text-danger': stats.flowAnomalies > 0}">{{ stats.flowAnomalies }} 点 ({{ stats.flowRate }}%)</span>
            </div>
            <div class="stat-item">
              <span class="label">总池体积异常:</span>
              <span class="value" :class="{'text-danger': stats.volAnomalies > 0}">{{ stats.volAnomalies }} 点 ({{ stats.volRate }}%)</span>
            </div>
            <div class="stat-item">
              <span class="label">溢流高危区间:</span>
              <span class="value text-danger" style="font-weight: bold;">{{ stats.warningIntervals }} 个</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="chart-list" v-loading="loading" element-loading-text="正在绘制多维参数特征曲线..." element-loading-spinner="el-icon-loading" v-if="hasData">
      <div class="chart-item-large" ref="chartSpp"></div>
      <div class="chart-item-large" ref="chartFlow"></div>
      <div class="chart-item-large" ref="chartVolume"></div>
      <div class="chart-item-large" ref="chartHookLoad"></div>
      <div class="chart-item-large" ref="chartTorque"></div>
      <div class="chart-item-large" ref="chartRop"></div>
    </div>
  </div>
</template>

<script>
import { getPtdEarlyWarningApi } from '@/api/index';
import * as echarts from 'echarts';

export default {
  name: 'ComprehensiveAnomaly',
  data() {
    return {
      loading: false,
      hasData: false,
      searchForm: {
        timeRange: ['2024-10-01 00:00:00', '2024-10-01 03:00:00'],
        shortWindow: null,
        longWindow: null,
        madWindow: null,
        kFactor: null
      },
      globalStatus: 'safe',
      stats: {
        sppAnomalies: 0, sppRate: 0,
        flowAnomalies: 0, flowRate: 0,
        volAnomalies: 0, volRate: 0,
        warningIntervals: 0
      },
      chartInstances: [],
      chartData: {
        times: [],
        spp: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        flow: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        volume: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        hookLoad: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        torque: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        rop: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        kickWarningAreas: []
      },
      resizeObserver: null // 用于监听侧边栏折叠导致的 DOM 宽度变化
    };
  },
  computed: {
    currentWellId() {
      return this.$store.state.jh || '';
    }
  },
  mounted() {
    // 初始化时间范围
    if (this.$store.state.StartTime) {
      try {
        const startStr = this.$store.state.StartTime.replace(/\//g, '-');
        const startDate = new Date(startStr);
        const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
        const fmt = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const h = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          const s = String(d.getSeconds()).padStart(2, '0');
          return `${y}-${m}-${day} ${h}:${min}:${s}`;
        };
        this.searchForm.timeRange = [fmt(startDate), fmt(endDate)];
      } catch (e) {
        this.searchForm.timeRange = ['2024-10-01 00:00:00', '2024-10-01 03:00:00'];
      }
    }

    // 问题3修复：使用 ResizeObserver 监听容器真实宽度变化，完美适配侧边栏折叠
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    if (this.$refs.container) {
      this.resizeObserver.observe(this.$refs.container);
    }
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.chartInstances.forEach(chart => chart.dispose());
  },
  methods: {
    handleResize() {
      // 优化：使用 requestAnimationFrame 防抖，保证重绘流畅
      requestAnimationFrame(() => {
        this.chartInstances.forEach(chart => chart.resize());
      });
    },

    isValidNumber(v) {
      return v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));
    },

    async fetchData() {
      if (!this.currentWellId) return this.$message.warning('请先在井眼选择中选择井号');
      if (!this.searchForm.timeRange || this.searchForm.timeRange.length < 2) return this.$message.warning('请选择时间范围');

      const { timeRange, shortWindow, longWindow, madWindow, kFactor } = this.searchForm;
      const params = {
        wellId: this.currentWellId,
        startTime: (timeRange[0] || '').toString().replace(' ', 'T'),
        endTime: (timeRange[1] || '').toString().replace(' ', 'T')
      };

      if (this.isValidNumber(shortWindow)) params.shortWindow = shortWindow;
      if (this.isValidNumber(longWindow)) params.longWindow = longWindow;
      if (this.isValidNumber(madWindow)) params.madWindow = madWindow;
      if (this.isValidNumber(kFactor)) params.kFactor = kFactor;

      this.loading = true;
      this.hasData = false;
      
      this.$nextTick(async () => {
        try {
          const res = await getPtdEarlyWarningApi(params);
          if (res && res.success && res.data && res.data.length > 0) {
            this.hasData = true;
            this.processChartData(res.data);
            this.$nextTick(() => { 
              this.renderAllCharts();
              this.$message.success('多维算法分析完成');
            });
          } else {
            this.$message.info('该时间段内未查询到有效数据');
            this.clearCharts();
          }
        } catch (error) {
          console.error('PTD 接口异常', error);
          this.$message.error('获取检测数据失败，请检查后端计算引擎');
          this.clearCharts();
        } finally {
          this.loading = false;
        }
      });
    },

    processChartData(data) {
      const resetParam = () => ({ orig: [], ptd: [], upper: [], lower: [], anomalies: [] });
      
      this.chartData = {
        times: [],
        spp: resetParam(), flow: resetParam(), volume: resetParam(),
        hookLoad: resetParam(), torque: resetParam(), rop: resetParam(),
        kickWarningAreas: []
      };

      let inWarning = false, warningStart = null;
      let globalDangerCount = 0, sppErr = 0, flowErr = 0, volErr = 0;
      const totalCount = data.length;

      const extract = (paramKey, itemData, index, isSpp, isFlow, isVol) => {
        this.chartData[paramKey].orig.push(itemData.originalValue);
        this.chartData[paramKey].ptd.push(itemData.ptdValue);
        this.chartData[paramKey].upper.push(itemData.upperThreshold);
        this.chartData[paramKey].lower.push(itemData.lowerThreshold);

        if (itemData.isAnomaly) {
          this.chartData[paramKey].anomalies.push([index, itemData.ptdValue]);
          if (isSpp) sppErr++;
          if (isFlow) flowErr++;
          if (isVol) volErr++;
        }
      };

      data.forEach((item, index) => {
        const time = item.logTime.replace('T', ' '); 
        this.chartData.times.push(time);

        extract('spp', item.spp, index, true, false, false);
        extract('flow', item.outletFlow, index, false, true, false);
        extract('volume', item.poolVolume, index, false, false, true);
        extract('hookLoad', item.hookLoad, index, false, false, false);
        extract('torque', item.torque, index, false, false, false);
        extract('rop', item.rop, index, false, false, false);

        if (item.isKickWarning) {
          if (!inWarning) { inWarning = true; warningStart = time; }
        } else {
          if (inWarning) {
            inWarning = false;
            this.chartData.kickWarningAreas.push([{ xAxis: warningStart }, { xAxis: data[index - 1].logTime.replace('T', ' ') }]);
            globalDangerCount++;
          }
        }
      });

      if (inWarning) {
        this.chartData.kickWarningAreas.push([{ xAxis: warningStart }, { xAxis: data[totalCount - 1].logTime.replace('T', ' ') }]);
        globalDangerCount++;
      }

      this.globalStatus = globalDangerCount > 0 ? 'danger' : 'safe';
      this.stats = {
        sppAnomalies: sppErr, sppRate: ((sppErr / totalCount) * 100).toFixed(1),
        flowAnomalies: flowErr, flowRate: ((flowErr / totalCount) * 100).toFixed(1),
        volAnomalies: volErr, volRate: ((volErr / totalCount) * 100).toFixed(1),
        warningIntervals: globalDangerCount
      };
    },

    renderAllCharts() {
      this.chartInstances.forEach(chart => chart.dispose());
      this.chartInstances = [];

      const { times, kickWarningAreas } = this.chartData;
      
      // 问题2修复：去掉了容易重叠的 label，背景色加深，结合全局图例展示
      const kickMarkArea = {
        itemStyle: { color: 'rgba(255, 77, 79, 0.15)' },
        label: { show: false }, 
        data: kickWarningAreas
      };

      this.initChart(this.$refs.chartSpp, '立压 SPP (MPa)', '#1890ff', times, this.chartData.spp, kickMarkArea);
      this.initChart(this.$refs.chartFlow, '出口流量 Flow (%)', '#13c2c2', times, this.chartData.flow, kickMarkArea);
      this.initChart(this.$refs.chartVolume, '总池体积 Volume (m³)', '#52c41a', times, this.chartData.volume, kickMarkArea);
      this.initChart(this.$refs.chartHookLoad, '钩载 HKLA (kN)', '#faad14', times, this.chartData.hookLoad, kickMarkArea);
      this.initChart(this.$refs.chartTorque, '扭矩 Torque (kN.m)', '#f5222d', times, this.chartData.torque, kickMarkArea);
      this.initChart(this.$refs.chartRop, '钻时 ROP (min/m)', '#722ed1', times, this.chartData.rop, kickMarkArea, true);

      echarts.connect(this.chartInstances);
    },

    initChart(domRef, title, origColor, xData, dataset, markArea, isInverse = false) {
      if (!domRef) return;
      const chart = echarts.init(domRef);
      
      const option = {
        // 问题1修复：调整标题位置，防止与Y轴文字重叠
        title: { text: title, left: 15, top: 18, textStyle: { fontSize: 15, color: '#333', fontWeight: 'bold' } },
        tooltip: { 
          trigger: 'axis', 
          axisPointer: { type: 'cross' },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          textStyle: { color: '#334155' }
        },
        legend: {
          data: ['原始测量值', 'PTD偏离度', 'MAD动态上限', 'MAD动态下限', '溢流高危区'],
          top: 18,
          right: 20
        },
        // 问题1修复：加大 top/left/right，给图注和Y轴标题充足的空间
        grid: { left: '60px', right: '60px', bottom: '45px', top: '75px' }, 
        dataZoom: [
          { type: 'inside', xAxisIndex: 0, filterMode: 'filter' },
          { type: 'slider', xAxisIndex: 0, height: 15, bottom: 5, borderColor: 'transparent', backgroundColor: '#f5f5f5', handleSize: '100%' }
        ],
        xAxis: {
          type: 'category',
          data: xData,
          boundaryGap: false,
          axisLabel: { color: '#64748b', formatter: (val) => val.split(' ')[1] } 
        },
        yAxis: [
          {
            type: 'value',
            name: '原始值',
            nameTextStyle: { align: 'right', padding: [0, 5, 0, 0] }, // 让文字靠右对齐，避开title
            scale: true, 
            inverse: isInverse,
            axisLabel: { color: origColor, fontWeight: 'bold' },
            splitLine: { show: false } 
          },
          {
            type: 'value',
            name: 'PTD基线',
            nameTextStyle: { align: 'left', padding: [0, 0, 0, 5] },
            scale: true, 
            position: 'right',
            axisLabel: { color: '#eab308' },
            splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
          }
        ],
        series: [
          {
            name: '原始测量值',
            type: 'line',
            yAxisIndex: 0, 
            data: dataset.orig,
            smooth: true,
            symbol: 'none',
            // 问题4修复：显式指明 itemStyle 的 color，确保 Legend 颜色与曲线强一致
            itemStyle: { color: origColor },
            lineStyle: { width: 3, color: origColor, shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.1)' },
            markArea: markArea
          },
          {
            name: 'PTD偏离度',
            type: 'line',
            yAxisIndex: 1, 
            data: dataset.ptd,
            smooth: false,
            symbol: 'none',
            itemStyle: { color: '#eab308' }, // 问题4修复：同步 Legend 颜色
            lineStyle: { width: 2, color: '#eab308' } 
          },
          {
            name: 'MAD动态上限',
            type: 'line',
            yAxisIndex: 1,
            data: dataset.upper,
            symbol: 'none',
            itemStyle: { color: '#ef4444' }, // 问题4修复：同步 Legend 颜色
            lineStyle: { width: 1.5, type: 'dashed', color: '#ef4444' } 
          },
          {
            name: 'MAD动态下限',
            type: 'line',
            yAxisIndex: 1,
            data: dataset.lower,
            symbol: 'none',
            itemStyle: { color: '#22c55e' }, // 问题4修复：同步 Legend 颜色
            lineStyle: { width: 1.5, type: 'dashed', color: '#22c55e' } 
          },
          {
            name: '突破阈值(异常)',
            type: 'scatter',
            yAxisIndex: 1,
            data: dataset.anomalies,
            itemStyle: { color: '#ef4444', shadowBlur: 8, shadowColor: 'rgba(239, 68, 68, 0.6)' },
            symbolSize: 8,
            zlevel: 10
          },
          {
            // 问题2补充：专为“溢流高危区”伪造一个空系列，以便在图例中展示对应的淡红色块解释
            name: '溢流高危区',
            type: 'line',
            itemStyle: { color: 'rgba(255, 77, 79, 0.5)' },
            lineStyle: { width: 0 }, 
            data: []
          }
        ]
      };
      
      chart.setOption(option);
      this.chartInstances.push(chart);
    },

    clearCharts() {
       this.chartInstances.forEach(chart => chart.clear());
       this.hasData = false;
       this.globalStatus = 'safe';
    }
  }
};
</script>

<style scoped>
.anomaly-container {
  padding: 15px;
  background-color: #f1f5f9; 
  min-height: 100vh;
  /* 确保容器宽度随外层布局自动拉伸 */
  width: 100%;
  box-sizing: border-box;
}

.search-card { margin-bottom: 15px; border-radius: 8px; border: none; }
.well-alert { margin-bottom: 12px; }

.ptd-collapse { border: none; margin-bottom: 5px; }
.ptd-collapse >>> .el-collapse-item__header { border: none; height: 36px; color: #3b82f6; font-weight: bold; background: transparent; }
.ptd-collapse >>> .el-collapse-item__wrap { border: none; background-color: #f8fafc; padding: 10px; border-radius: 6px; }
.ptd-hint { font-size: 12px; color: #f59e0b; clear: both; }

/* 态势感知仪表盘 */
.dashboard-panel { margin-bottom: 15px; }

.status-card {
  display: flex; align-items: center; padding: 20px; border-radius: 8px; height: 100px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: all 0.3s;
}

.safe-bg { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; }
.danger-bg { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; animation: pulse-border 2s infinite; }

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
  70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.status-icon i { font-size: 48px; margin-right: 15px; }
.safe-bg .status-icon i { color: #22c55e; }
.danger-bg .status-icon i { color: #ef4444; }

.status-info { display: flex; flex-direction: column; }
.status-title { font-size: 13px; color: #64748b; margin-bottom: 4px; }
.status-text { font-size: 18px; font-weight: bold; color: #0f172a; }
.danger-bg .status-text { color: #b91c1c; }
.status-mechanism { font-size: 12px; color: #ef4444; margin-top: 5px; background: rgba(255, 255, 255, 0.7); padding: 2px 8px; border-radius: 4px; font-weight: 500;}

/* 统计卡片 */
.stats-card { height: 142px; border-radius: 8px; border: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.stats-card >>> .el-card__header { padding: 12px 15px; background: #ffffff; font-weight: bold; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0; }
.stats-card >>> .el-card__body { padding: 15px; }
.stats-grid { display: flex; justify-content: space-between; align-items: center; height: 100%;}
.stat-item { text-align: center; display: flex; flex-direction: column; gap: 8px;}
.stat-item .label { font-size: 13px; color: #64748b; }
.stat-item .value { font-size: 20px; font-weight: bold; color: #0f172a; font-family: monospace;}
.text-danger { color: #ef4444 !important; }

/* 瀑布流图表区 */
.chart-list {
  display: flex;
  flex-direction: column;
  gap: 20px; 
  width: 100%;
}

.chart-item-large {
  width: 100%;
  height: 380px; 
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

@media screen and (max-width: 1400px) {
  .dashboard-panel .el-col { width: 100%; margin-bottom: 15px; }
  .chart-item-large { height: 350px; }
}
</style>
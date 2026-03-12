<template>
  <div class="anomaly-container">
    <!-- 未选井时弱提示 -->
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再进行综合异常检测。
    </el-alert>

    <!-- 顶部查询表单 -->
    <el-card class="box-card search-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="small">
        <el-form-item label="当前井号">
          <el-tag type="info" size="medium">{{ currentWellId || '未选择' }}</el-tag>
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
            style="width: 380px;">
          </el-date-picker>
        </el-form-item>

        <!-- 高级参数 PTD/MAD 折叠 -->
        <el-collapse class="ptd-collapse">
          <el-collapse-item title="高级参数 (PTD/MAD)" name="ptd">
            <el-form-item label="短窗">
              <el-input
                v-model.number="searchForm.shortWindow"
                placeholder="默认 5"
                style="width: 120px; margin-right: 8px;"
                type="number"
                min="1" />
            </el-form-item>
            <el-form-item label="长窗">
              <el-input
                v-model.number="searchForm.longWindow"
                placeholder="默认 50"
                style="width: 120px; margin-right: 8px;"
                type="number"
                min="1" />
            </el-form-item>
            <el-form-item label="MAD 窗口">
              <el-input
                v-model.number="searchForm.madWindow"
                placeholder="默认 300"
                style="width: 120px; margin-right: 8px;"
                type="number"
                min="1" />
            </el-form-item>
            <el-form-item label="K 系数">
              <el-input
                v-model.number="searchForm.kFactor"
                placeholder="默认 3.0"
                style="width: 120px;"
                type="number"
                step="0.1"
                min="0.01" />
            </el-form-item>
            <div class="ptd-hint">如不填写，将使用系统默认值：短窗 5、长窗 50、MAD=300、K=3.0</div>
          </el-collapse-item>
        </el-collapse>

        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="fetchData"
            :loading="loading"
            :disabled="!currentWellId">
            开始异常检测
          </el-button>
        </el-form-item>

        <!-- 综合状态指示灯 -->
        <el-form-item style="float: right;">
          <div class="status-indicator" :class="globalStatus === 'danger' ? 'danger' : 'safe'">
            <i :class="globalStatus === 'danger' ? 'el-icon-warning' : 'el-icon-success'"></i>
            综合检测状态：{{ globalStatus === 'danger' ? '发现高风险溢流异常！' : '井下状态平稳' }}
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 六宫格工程图表展示区 -->
    <div class="chart-grid" v-loading="loading" element-loading-text="正在进行机理协同异常分析...">
      <div class="chart-item" ref="chartSpp"></div>
      <div class="chart-item" ref="chartFlow"></div>
      <div class="chart-item" ref="chartVolume"></div>
      <div class="chart-item" ref="chartHookLoad"></div>
      <div class="chart-item" ref="chartTorque"></div>
      <div class="chart-item" ref="chartRop"></div>
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
      searchForm: {
        timeRange: ['2024-10-01 00:00:00', '2024-10-01 03:00:00'],
        shortWindow: null,
        longWindow: null,
        madWindow: null,
        kFactor: null
      },
      globalStatus: 'safe',
      chartInstances: [],
      chartData: {
        times: [],
        spp: [], sppAnomalies: [],
        flow: [], flowAnomalies: [],
        volume: [], volumeAnomalies: [],
        hookLoad: [], hookLoadAnomalies: [],
        torque: [], torqueAnomalies: [],
        rop: [], ropAnomalies: [],
        kickWarningAreas: []
      }
    };
  },
  computed: {
    currentWellId() {
      return this.$store.state.jh || '';
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
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
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.chartInstances.forEach(chart => chart.dispose());
  },
  methods: {
    handleResize() {
      this.chartInstances.forEach(chart => chart.resize());
    },

    async fetchData() {
      if (!this.currentWellId) {
        this.$message.warning('请先在井眼选择中选择井号');
        return;
      }
      if (!this.searchForm.timeRange || this.searchForm.timeRange.length < 2) {
        this.$message.warning('请选择时间范围');
        return;
      }

      const { timeRange, shortWindow, longWindow, madWindow, kFactor } = this.searchForm;
      const params = {
        wellId: this.currentWellId,
        startTime: (timeRange[0] || '').toString().replace(' ', 'T'),
        endTime: (timeRange[1] || '').toString().replace(' ', 'T')
      };

      const hasShort = this.isValidNumber(shortWindow);
      const hasLong = this.isValidNumber(longWindow);
      const hasMad = this.isValidNumber(madWindow);
      const hasK = this.isValidNumber(kFactor);
      if (hasShort && shortWindow <= 0) {
        this.$message.warning('短窗须大于 0');
        return;
      }
      if (hasLong && longWindow <= 0) {
        this.$message.warning('长窗须大于 0');
        return;
      }
      if (hasMad && madWindow <= 0) {
        this.$message.warning('MAD 窗口须大于 0');
        return;
      }
      if (hasK && kFactor <= 0) {
        this.$message.warning('K 系数须大于 0');
        return;
      }

      if (hasShort) params.shortWindow = shortWindow;
      if (hasLong) params.longWindow = longWindow;
      if (hasMad) params.madWindow = madWindow;
      if (hasK) params.kFactor = kFactor;

      const allEmpty = !hasShort && !hasLong && !hasMad && !hasK;
      if (allEmpty) {
        this.$message.info('PTD/MAD 参数未填写，本次分析将使用系统默认值（短窗 5、长窗 50、MAD=300、K=3.0）。');
      }

      this.loading = true;
      try {
        const res = await getPtdEarlyWarningApi(params);

        if (res && res.success && res.data && res.data.length > 0) {
          this.processChartData(res.data);
          this.renderAllCharts();
          this.$message.success('分析完成');
        } else if (res && !res.success) {
          this.$message.error(res.msg || res.message || '请求失败');
          this.clearCharts();
        } else {
          this.$message.info('该时间段内未查询到有效数据');
          this.clearCharts();
        }
      } catch (error) {
        console.error('PTD 接口异常', error);
        let msg = '获取检测数据失败，请检查网络或后端服务';
        if (error && error.response) {
          const d = error.response.data;
          if (d && (d.msg || d.message)) msg = d.msg || d.message;
          else if (error.response.status) msg = `请求失败 (${error.response.status})`;
        } else if (error && error.message) {
          msg = error.message;
        }
        this.$message.error(msg);
        this.clearCharts();
      } finally {
        this.loading = false;
      }
    },

    isValidNumber(v) {
      return v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));
    },

    // 清洗和组装 ECharts 所需的数据结构
    processChartData(data) {
      // 重置数据
      this.chartData = {
        times: [],
        spp: [], sppAnomalies: [],
        flow: [], flowAnomalies: [],
        volume: [], volumeAnomalies: [],
        hookLoad: [], hookLoadAnomalies: [],
        torque: [], torqueAnomalies: [],
        rop: [], ropAnomalies: [],
        kickWarningAreas: []
      };

      let inWarning = false;
      let warningStart = null;
      let hasGlobalDanger = false;

      data.forEach((item, index) => {
        const time = item.logTime.replace('T', ' '); // 处理 ISO 时间
        this.chartData.times.push(time);

        // 1. 组装折线原始数据
        this.chartData.spp.push(item.spp.originalValue);
        this.chartData.flow.push(item.outletFlow.originalValue);
        this.chartData.volume.push(item.poolVolume.originalValue);
        this.chartData.hookLoad.push(item.hookLoad.originalValue);
        this.chartData.torque.push(item.torque.originalValue);
        this.chartData.rop.push(item.rop.originalValue);

        // 2. 组装单参数局部异常点（如果 isAnomaly 为 true，记录 [索引, 值]，否则为空）
        // 这里隐去了 PTD 概念，只展示“该点有异常”
        if (item.spp.isAnomaly) this.chartData.sppAnomalies.push([index, item.spp.originalValue]);
        if (item.outletFlow.isAnomaly) this.chartData.flowAnomalies.push([index, item.outletFlow.originalValue]);
        if (item.poolVolume.isAnomaly) this.chartData.volumeAnomalies.push([index, item.poolVolume.originalValue]);
        if (item.hookLoad.isAnomaly) this.chartData.hookLoadAnomalies.push([index, item.hookLoad.originalValue]);
        if (item.torque.isAnomaly) this.chartData.torqueAnomalies.push([index, item.torque.originalValue]);
        if (item.rop.isAnomaly) this.chartData.ropAnomalies.push([index, item.rop.originalValue]);

        // 3. 计算“综合异常警报”的连续区间 (MarkArea)
        if (item.isKickWarning) {
          hasGlobalDanger = true;
          if (!inWarning) {
            inWarning = true;
            warningStart = time;
          }
        } else {
          if (inWarning) {
            inWarning = false;
            // 闭合一个异常区间
            this.chartData.kickWarningAreas.push([
              { xAxis: warningStart },
              { xAxis: data[index - 1].logTime.replace('T', ' ') }
            ]);
          }
        }
      });

      // 处理最后一直处于异常状态的情况
      if (inWarning) {
        this.chartData.kickWarningAreas.push([
          { xAxis: warningStart },
          { xAxis: data[data.length - 1].logTime.replace('T', ' ') }
        ]);
      }

      this.globalStatus = hasGlobalDanger ? 'danger' : 'safe';
    },

    // 渲染所有图表
    renderAllCharts() {
      this.chartInstances.forEach(chart => chart.dispose());
      this.chartInstances = [];

      const { times, kickWarningAreas } = this.chartData;

      // 定义公共 MarkArea 配置 (用于所有图表的综合预警红色背景)
      const commonMarkArea = {
        itemStyle: { color: 'rgba(255, 77, 79, 0.15)' },
        label: { show: true, position: 'insideTop', color: '#ff4d4f', formatter: '综合异常' },
        data: kickWarningAreas
      };

      // 渲染 6 个维度的图表
      this.initSingleChart(this.$refs.chartSpp, '立压 (MPa)', '#3aa1ff', times, this.chartData.spp, this.chartData.sppAnomalies, commonMarkArea);
      this.initSingleChart(this.$refs.chartFlow, '出口流量 (%)', '#36cbcb', times, this.chartData.flow, this.chartData.flowAnomalies, commonMarkArea);
      this.initSingleChart(this.$refs.chartVolume, '总池体积 (m³)', '#4ecb73', times, this.chartData.volume, this.chartData.volumeAnomalies, commonMarkArea);
      this.initSingleChart(this.$refs.chartHookLoad, '钩载 (kN)', '#fbd437', times, this.chartData.hookLoad, this.chartData.hookLoadAnomalies, commonMarkArea);
      this.initSingleChart(this.$refs.chartTorque, '扭矩 (kN.m)', '#f2637b', times, this.chartData.torque, this.chartData.torqueAnomalies, commonMarkArea);
      this.initSingleChart(this.$refs.chartRop, '钻时 (min/m)', '#975fe4', times, this.chartData.rop, this.chartData.ropAnomalies, commonMarkArea, true); // 钻时通常是反向看的，但此处保留常规

      // 开启多图表 Tooltip 和 DataZoom 联动
      echarts.connect(this.chartInstances);
    },

    // 封装通用图表初始化函数
    initSingleChart(domRef, title, color, xData, yData, anomalyData, markArea, isInverse = false) {
      const chart = echarts.init(domRef);
      const option = {
        title: { 
            text: title, 
            left: 10, 
            top: 10, 
            textStyle: { fontSize: 14, color: '#666' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        grid: { left: '8%', right: '3%', bottom: '15%', top: '25%' },
        dataZoom: [
          { type: 'inside', xAxisIndex: 0, filterMode: 'filter' },
          { type: 'slider', xAxisIndex: 0, height: 12, bottom: 5 }
        ],
        xAxis: {
          type: 'category',
          data: xData,
          boundaryGap: false,
          axisLine: { lineStyle: { color: '#ccc' } }
        },
        yAxis: {
          type: 'value',
          inverse: isInverse,
          splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
          axisLine: { show: true, lineStyle: { color: '#ccc' } }
        },
        series: [
          // 1. 正常工程折线
          {
            name: title.split(' ')[0],
            type: 'line',
            data: yData,
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color: color },
            itemStyle: { color: color },
            markArea: markArea // 注入全局异常红带
          },
          // 2. 单参数异常红点 (隐去PTD算法细节，仅显示结果)
          {
            name: '参数异常波动',
            type: 'scatter',
            data: anomalyData,
            itemStyle: { color: '#ff4d4f', borderColor: '#fff', borderWidth: 1 },
            symbolSize: 6,
            zlevel: 10
          }
        ]
      };
      chart.setOption(option);
      this.chartInstances.push(chart);
    },

    clearCharts() {
       this.chartInstances.forEach(chart => chart.clear());
       this.globalStatus = 'safe';
    }
  }
};
</script>

<style scoped>
.anomaly-container {
  padding: 15px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.search-card {
  margin-bottom: 15px;
  border-radius: 8px;
}

.well-alert {
  margin-bottom: 12px;
}

.ptd-collapse {
  margin-bottom: 8px;
  border: none;
}

.ptd-collapse >>> .el-collapse-item__header {
  border: none;
  height: 40px;
}

.ptd-collapse >>> .el-collapse-item__wrap {
  border: none;
}

.ptd-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  margin-bottom: 4px;
}

.status-indicator {
  padding: 8px 20px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator.safe {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-indicator.danger {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
  animation: flash 1.5s infinite;
}

@keyframes flash {
  0% { box-shadow: 0 0 5px #ff4d4f; }
  50% { box-shadow: 0 0 15px #ff4d4f; }
  100% { box-shadow: 0 0 5px #ff4d4f; }
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 300px);
  gap: 15px;
}

.chart-item {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 10px;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .chart-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 300px);
  }
}
</style>
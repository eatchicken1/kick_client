<template>
  <div class="anomaly-container">
    <!-- 顶部查询表单 -->
    <el-card class="box-card search-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="small">
        <el-form-item label="分析井号">
          <el-input v-model="searchForm.wellId" placeholder="例如: 大页1H24" clearable></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>

        <!-- PTD / MAD 动态阈值高级参数配置（可选，不填使用后端默认值） -->
        <el-form-item label="高级参数(PTD/MAD)">
          <el-input
            v-model.number="searchForm.shortWindow"
            placeholder="短窗 shortWindow，默认 5"
            style="width: 150px; margin-right: 8px;" />
          <el-input
            v-model.number="searchForm.longWindow"
            placeholder="长窗 longWindow，默认 50"
            style="width: 160px; margin-right: 8px;" />
          <el-input
            v-model.number="searchForm.madWindow"
            placeholder="MAD 窗口 madWindow，默认 300"
            style="width: 190px; margin-right: 8px;" />
          <el-input
            v-model.number="searchForm.kFactor"
            placeholder="K 系数 kFactor，默认 3.0"
            style="width: 170px;" />
        </el-form-item>
        <el-form-item>
          <span style="font-size: 12px; color: #909399;">
            如不填写，上述 PTD/MAD 参数将使用系统推荐默认值：短窗 5、长窗 50、MAD=300、K=3.0
          </span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchData" :loading="loading">
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
// 请根据您的实际 request 路径进行调整
import request from '@/utils/request'; 
import * as echarts from 'echarts';

export default {
  name: 'ComprehensiveAnomaly',
  data() {
    return {
      loading: false,
      searchForm: {
        wellId: '大页1H24',
        timeRange: ['2024-10-01 00:00:00', '2024-10-01 03:00:00'],
        // PTD / MAD 动态阈值算法参数（可选，由用户在前端配置；不填则使用后端默认值）
        shortWindow: null,
        longWindow: null,
        madWindow: null,
        kFactor: null
      },
      globalStatus: 'safe', // safe | danger
      chartInstances: [], // 存放所有 ECharts 实例用于联动和销毁
      
      // 存储格式化后的绘图数据
      chartData: {
        times: [],
        spp: [], sppAnomalies: [],
        flow: [], flowAnomalies: [],
        volume: [], volumeAnomalies: [],
        hookLoad: [], hookLoadAnomalies: [],
        torque: [], torqueAnomalies: [],
        rop: [], ropAnomalies: [],
        kickWarningAreas: [] // 综合异常的背景高亮区域
      }
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.chartInstances.forEach(chart => chart.dispose());
  },
  methods: {
    handleResize() {
      this.chartInstances.forEach(chart => chart.resize());
    },
    
    // 调用后端 API 获取数据
    async fetchData() {
      if (!this.searchForm.wellId || !this.searchForm.timeRange || this.searchForm.timeRange.length < 2) {
        this.$message.warning("请完整填写井号与时间范围");
        return;
      }

      this.loading = true;
      try {
        // 组装基础查询参数
        const { wellId, timeRange, shortWindow, longWindow, madWindow, kFactor } = this.searchForm;
        const params = {
          wellId: wellId,
          startTime: timeRange[0],
          endTime: timeRange[1]
        };

        // 判断是否用户有填写高级参数
        const hasShort = shortWindow !== null && shortWindow !== undefined && shortWindow !== '' && !Number.isNaN(shortWindow);
        const hasLong = longWindow !== null && longWindow !== undefined && longWindow !== '' && !Number.isNaN(longWindow);
        const hasMad = madWindow !== null && madWindow !== undefined && madWindow !== '' && !Number.isNaN(madWindow);
        const hasK = kFactor !== null && kFactor !== undefined && kFactor !== '' && !Number.isNaN(kFactor);
        const allEmpty = !hasShort && !hasLong && !hasMad && !hasK;

        // 仅在用户填写时才把参数拼到 Query 中，未填写则完全依赖后端默认值
        if (hasShort) params.shortWindow = shortWindow;
        if (hasLong) params.longWindow = longWindow;
        if (hasMad) params.madWindow = madWindow;
        if (hasK) params.kFactor = kFactor;

        // 若完全未填写任何 PTD/MAD 参数，给出信息级弱提示，但不打断本次计算
        if (allEmpty) {
          this.$message.info("PTD/MAD 参数未填写，本次分析将使用系统默认值（短窗 5、长窗 50、MAD=300、K=3.0）。");
        }

        const res = await request({
          url: 'http://localhost:18300/api/Monitor/early-warning/ptd-analysis', // 直接调用后端服务
          method: 'get',
          params
        });

        if (res && res.success && res.data && res.data.length > 0) {
          this.processChartData(res.data);
          this.renderAllCharts();
          this.$message.success("分析完成");
        } else {
          this.$message.info("该时间段内未查询到有效数据");
          this.clearCharts();
        }
      } catch (error) {
        console.error(error);
        this.$message.error("获取检测数据失败，请检查网络或后端服务");
      } finally {
        this.loading = false;
      }
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
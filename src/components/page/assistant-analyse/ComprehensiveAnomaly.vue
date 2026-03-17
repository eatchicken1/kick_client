<template>
  <div class="anomaly-container" ref="container">
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再进行综合溢流实时异常检测。
    </el-alert>

    <el-card class="box-card search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="small">
        <el-form-item label="当前井号">
          <el-tag type="info" size="medium" effect="dark">{{ currentWellId || '未选择' }}</el-tag>
        </el-form-item>
        
        <el-form-item label="起始时间">
          <el-date-picker
            v-model="searchForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="yyyy/MM/dd HH:mm:ss"
            value-format="yyyy/MM/dd HH:mm:ss"
            style="width: 220px;">
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="success" 
            icon="el-icon-video-play"
            :loading="isSimulating || isStopping" 
            @click="startSimulation">
            启动流式预警
          </el-button>
	          <el-button 
	            type="danger" 
	            icon="el-icon-video-pause"
	            :disabled="!isSimulating || isStopping" 
	            @click="stopSimulation()">
	            停止监测
	          </el-button>
        </el-form-item>
      </el-form>

      <el-alert 
        v-if="isSimulating && isColdStart" 
        type="warning" 
        show-icon 
        title="模型初始化中 (冷启动)：正在积累背景数据以建立动态阈值..." 
        :closable="false" 
        style="margin-bottom: 15px;" />

      <div v-if="isSimulating" class="warning-banner" :class="'warning-' + warningLevel">
        <i :class="warningLevel === 0 ? 'el-icon-success' : 'el-icon-warning'"></i>
        <span v-if="warningLevel === 0">井筒状态正常</span>
        <span v-else-if="warningLevel === 1">⚠️ {{ latestWarningMsg }}</span>
        <span v-else-if="warningLevel === 2">🔴 {{ latestWarningMsg }}</span>
      </div>

      <div class="charts-container" v-if="hasData">
        <div class="chart-item-large" ref="chartSpp"></div>
        <div class="chart-item-large" ref="chartFlow"></div>
        <div class="chart-item-large" ref="chartVolume"></div>
        <div class="chart-item-large" ref="chartHookLoad"></div>
        <div class="chart-item-large" ref="chartTorque"></div>
        <div class="chart-item-large" ref="chartRop"></div>
      </div>

	      <div v-if="!isSimulating && hasData" class="chart-hint">
        <i class="el-icon-info"></i> 监测已停止，图表数据已保留。可使用底部滑块查看历史数据。
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :class="'dialog-' + warningLevel">
      <div class="logic-tree-container" v-if="latestWarningMsg">
        <div class="logic-result" :class="'level-' + warningLevel">
          <i :class="warningLevel === 2 ? 'el-icon-warning' : 'el-icon-info'"></i> 
          诊断结论: <strong>{{ latestWarningMsg }}</strong>
        </div>
        <div class="logic-line-vertical"></div>
        <div class="logic-gate">AND (需同时满足以下机理)</div>
        <div class="logic-line-vertical"></div>
        <div class="logic-branches">
          <div class="logic-branch" v-for="(cond, idx) in activeConditions" :key="idx">
            <div class="param-box"><span class="param-icon">{{ cond.icon }}</span>{{ cond.name }}</div>
            <div class="logic-line-horizontal"></div>
            <div class="dir-box" :class="cond.dir">{{ cond.text }} <i :class="cond.dir === 'low' ? 'el-icon-bottom' : (cond.dir === 'high' ? 'el-icon-top' : 'el-icon-right')"></i></div>
          </div>
        </div>
        <div class="logic-explanation"><strong>📝 井下物理机理解析：</strong>{{ activeDescription }}</div>
      </div>
      <div v-else class="safe-result">
        <i class="el-icon-success"></i> 井筒状态正常，暂无溢流风险
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import * as signalR from '@microsoft/signalr';
import { Message, Notification } from 'element-ui';

const MAX_POINTS = 300;
const METRIC_KEYS = ['spp', 'flow', 'volume', 'hookload', 'torque', 'rop'];

const RULE_KNOWLEDGE_BASE = {
  一级预警: {
    desc: '钻遇地层裂缝或溶洞时，钻头突然失去反作用力，导致钻时、扭矩、立压骤降，钩载上升。',
    conditions: [
      { name: '立压', icon: '⏱️', dir: 'low', text: '突破下限' },
      { name: '扭矩', icon: '⚙️', dir: 'low', text: '突破下限' },
      { name: '钻时', icon: '⛏️', dir: 'low', text: '突破下限' },
      { name: '钩载', icon: '🏗️', dir: 'high', text: '突破上限' }
    ]
  },
  二级预警: {
    desc: '地层流体侵入井筒导致液柱密度降低，因流体膨胀导致出口流量与泥浆池体积增加。',
    conditions: [
      { name: '立压', icon: '⏱️', dir: 'low', text: '突破下限' },
      { name: '出口流量', icon: '🌊', dir: 'high', text: '突破上限' },
      { name: '总池体积', icon: '🛢️', dir: 'high', text: '突破上限' }
    ]
  },
  关注: {
    desc: '井筒内流体压力已建立新平衡，立压不再下降但出口流量和池体积仍在增加。',
    conditions: [
      { name: '立压', icon: '⏱️', dir: 'none', text: '保持稳定' },
      { name: '出口流量', icon: '🌊', dir: 'high', text: '突破上限' },
      { name: '总池体积', icon: '🛢️', dir: 'high', text: '突破上限' }
    ]
  }
};

function createMetricSeries() {
  return {
    orig: [],
    ptd: [],
    upper: [],
    lower: [],
    anomalies: []
  };
}

export default {
  name: 'ComprehensiveAnomaly',
  data() {
    return {
      searchForm: {
        startTime: '',
        shortWindow: 10,
        longWindow: 100,
        madWindow: 500,
        kFactor: 3.0
      },
      isSimulating: false,
      isColdStart: false,
      hasData: false,
      latestWarningMsg: '',
      latestWarningType: '',
      dialogVisible: false,
      hubConnection: null,
      chartInstances: {},
      chartData: {
        times: [],
        spp: createMetricSeries(),
        flow: createMetricSeries(),
        volume: createMetricSeries(),
        hookload: createMetricSeries(),
        torque: createMetricSeries(),
        rop: createMetricSeries(),
        kickWarningAreas: []
      },
      lastWarningTime: 0,
      isStopping: false,
      resizeObserver: null,
      activeRunId: 0
    };
  },
  computed: {
    currentWellId() {
      return this.$store.state.jh || '';
    },
    warningLevel() {
      if (!this.latestWarningMsg) return 0;
      if (this.latestWarningMsg.includes('一级')) return 2;
      if (this.latestWarningMsg.includes('二级')) return 1;
      return 1;
    },
    dialogTitle() {
      if (this.warningLevel === 0) return '✅ 综合工况风险树溯源';
      if (this.warningLevel === 2) return '🔴 综合工况风险树溯源 - 一级预警';
      return '⚠️ 综合工况风险树溯源 - 二级预警';
    },
    activeConditions() {
      if (!this.latestWarningMsg) return [];
      if (this.latestWarningMsg.includes('一级')) return RULE_KNOWLEDGE_BASE.一级预警.conditions;
      if (this.latestWarningMsg.includes('二级')) return RULE_KNOWLEDGE_BASE.二级预警.conditions;
      return RULE_KNOWLEDGE_BASE.关注.conditions;
    },
    activeDescription() {
      if (!this.latestWarningMsg) return '';
      if (this.latestWarningMsg.includes('一级')) return RULE_KNOWLEDGE_BASE.一级预警.desc;
      if (this.latestWarningMsg.includes('二级')) return RULE_KNOWLEDGE_BASE.二级预警.desc;
      return RULE_KNOWLEDGE_BASE.关注.desc;
    },
  },
  watch: {
    currentWellId(newVal, oldVal) {
      if (newVal === oldVal) return;
      this.handleWellChange(newVal, oldVal);
    }
  },
  mounted() {
    this.initTimeRange();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          Object.values(this.chartInstances).forEach((chart) => {
            if (chart) chart.resize();
          });
        });
      });

      if (this.$refs.container) {
        this.resizeObserver.observe(this.$refs.container);
      }
    }
  },
  beforeDestroy() {
    this.stopSimulation(undefined, { silent: true });
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.disposeCharts();
  },
  methods: {
    initTimeRange() {
      if (!this.searchForm.startTime) {
        this.searchForm.startTime = this.formatDate(new Date());
      }
    },

    formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}/${m}/${d} ${h}:${min}:${s}`;
    },

    parseDateTime(value) {
      if (!value) return null;

      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
      }

      const text = String(value).trim();

      let date = new Date(text);
      if (!Number.isNaN(date.getTime())) return date;

      let normalized = text.replace('T', ' ');
      normalized = normalized.replace(/\.\d+(?=[+-]\d{2}:\d{2}$)/, '');
      date = new Date(normalized);
      if (!Number.isNaN(date.getTime())) return date;

      const match = text.match(
        /(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2}):(\d{1,2}):(\d{1,2})/
      );

      if (match) {
        const y = Number(match[1]);
        const m = Number(match[2]) - 1;
        const d = Number(match[3]);
        const h = Number(match[4]);
        const min = Number(match[5]);
        const s = Number(match[6]);
        date = new Date(y, m, d, h, min, s);
        return Number.isNaN(date.getTime()) ? null : date;
      }

      return null;
    },


    buildSimulationConfig() {
      return JSON.stringify({
        shortWindow: this.searchForm.shortWindow,
        longWindow: this.searchForm.longWindow,
        madWindow: this.searchForm.madWindow,
        kFactor: this.searchForm.kFactor
      });
    },

    resetChartData() {
      this.chartData.times = [];
      METRIC_KEYS.forEach((key) => {
        this.chartData[key].orig = [];
        this.chartData[key].ptd = [];
        this.chartData[key].upper = [];
        this.chartData[key].lower = [];
        this.chartData[key].anomalies = [];
      });
      this.chartData.kickWarningAreas = [];
      this.latestWarningMsg = '';
      this.latestWarningType = '';
      this.lastWarningTime = 0;
      this.dialogVisible = false;
    },

    disposeCharts() {
      Object.values(this.chartInstances).forEach((chart) => {
        if (chart) {
          chart.dispose();
        }
      });
      this.chartInstances = {};
    },

    ensureChartsReady() {
      this.$nextTick(() => {
        if (!this.hasData) return;
        if (Object.keys(this.chartInstances).length > 0) return;
        this.initAllCharts();
      });
    },

    initChart(refName, title, color, isInverse = false) {
      const ref = this.$refs[refName];
      if (!ref) return null;

      const chart = echarts.init(ref);

      let initialZoomStart = this.chartData.times[0];
      const initialZoomEnd = this.chartData.times[this.chartData.times.length - 1];

      if (this.chartData.times.length > 0) {
        const endTs = new Date(initialZoomEnd.replace(/-/g, '/')).getTime();
        const targetStartTs = endTs - 30 * 60 * 1000;

        for (let i = this.chartData.times.length - 1; i >= 0; i -= 1) {
          const ts = new Date(this.chartData.times[i].replace(/-/g, '/')).getTime();
          if (ts <= targetStartTs) {
            initialZoomStart = this.chartData.times[i];
            break;
          }
        }
      }

      const paramKey = refName.replace('chart', '').toLowerCase();
      const dataSet = this.chartData[paramKey] || createMetricSeries();
      const kickMarkArea = {
        itemStyle: { color: 'rgba(255, 77, 79, 0.12)' },
        label: {
          show: true,
          position: 'insideTop',
          color: '#c0392b',
          fontWeight: 'bold',
          backgroundColor: 'rgba(255,255,255,0.85)',
          padding: [4, 6],
          borderRadius: 4,
          offset: [0, 10]
        },
        data: this.chartData.kickWarningAreas
      };

      chart.setOption({
        title: {
          text: title,
          left: 15,
          top: 15,
          textStyle: { fontSize: 14, color: '#333' }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['原始值', 'PTD偏离', 'MAD上限', 'MAD下限'], top: 15, right: 20 },
        grid: { left: '60px', right: '60px', bottom: '45px', top: '75px' },
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'filter',
            startValue: initialZoomStart,
            endValue: initialZoomEnd
          },
          {
            type: 'slider',
            xAxisIndex: 0,
            height: 15,
            bottom: 5,
            startValue: initialZoomStart,
            endValue: initialZoomEnd
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.chartData.times,
          axisLabel: {
            formatter: (val) => val.split(' ')[1] || val
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '原始值',
            scale: true,
            inverse: isInverse,
            axisLabel: { color },
            splitLine: { show: false }
          },
          {
            type: 'value',
            name: 'PTD基线',
            scale: true,
            position: 'right',
            axisLabel: { color: '#eab308' },
            splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
          }
        ],
        series: [
          {
            name: '原始值',
            type: 'line',
            yAxisIndex: 0,
            data: dataSet.orig,
            sampling: 'lttb',
            showSymbol: false,
            itemStyle: { color },
            lineStyle: { width: 2 },
            markArea: kickMarkArea
          },
          {
            name: 'PTD偏离',
            type: 'line',
            yAxisIndex: 1,
            data: dataSet.ptd,
            sampling: 'lttb',
            showSymbol: false,
            itemStyle: { color: '#eab308' },
            lineStyle: { width: 1.5 }
          },
          {
            name: 'MAD上限',
            type: 'line',
            yAxisIndex: 1,
            data: dataSet.upper,
            sampling: 'lttb',
            showSymbol: false,
            itemStyle: { color: '#ef4444' },
            lineStyle: { width: 1, type: 'dashed' }
          },
          {
            name: 'MAD下限',
            type: 'line',
            yAxisIndex: 1,
            data: dataSet.lower,
            sampling: 'lttb',
            showSymbol: false,
            itemStyle: { color: '#22c55e' },
            lineStyle: { width: 1, type: 'dashed' }
          },
          {
            name: '突破阈值',
            type: 'scatter',
            yAxisIndex: 1,
            data: dataSet.anomalies,
            large: true,
            itemStyle: { color: '#ef4444' },
            symbolSize: 5,
            zlevel: 10
          }
        ],
        animation: false
      });

      return chart;
    },

    initAllCharts() {
      this.chartInstances.spp = this.initChart('chartSpp', '立压 SPP (MPa)', '#1890ff');
      this.chartInstances.flow = this.initChart('chartFlow', '出口流量 Flow (%)', '#13c2c2');
      this.chartInstances.volume = this.initChart('chartVolume', '总池体积 Volume (m³)', '#52c41a');
      this.chartInstances.hookload = this.initChart('chartHookLoad', '钩载 HKLA (kN)', '#faad14');
      this.chartInstances.torque = this.initChart('chartTorque', '扭矩 Torque (kN.m)', '#f5222d');
      this.chartInstances.rop = this.initChart('chartRop', '钻时 ROP (min/m)', '#722ed1', true);

      const charts = Object.values(this.chartInstances).filter(Boolean);
      if (charts.length > 0) {
        echarts.connect(charts);
      }
    },

    appendMetricPoint(metricKey, metricDto, timeIndex) {
      const target = this.chartData[metricKey];
      if (!target) return;

      if (metricDto) {
        target.orig.push(metricDto.originalValue);
        target.ptd.push(metricDto.ptdValue);
        target.upper.push(metricDto.upperThreshold);
        target.lower.push(metricDto.lowerThreshold);

        if (metricDto.isAnomaly) {
          target.anomalies.push([timeIndex, metricDto.ptdValue]);
        }
        return;
      }

      target.orig.push(null);
      target.ptd.push(null);
      target.upper.push(null);
      target.lower.push(null);
    },

    trimWarningAreas() {
      if (this.chartData.times.length === 0 || this.chartData.kickWarningAreas.length === 0) return;

      const firstTime = this.chartData.times[0];
      const validTimes = new Set(this.chartData.times);

      this.chartData.kickWarningAreas = this.chartData.kickWarningAreas
        .map((area) => {
          const start = { ...(area[0] || {}) };
          const end = { ...(area[1] || {}) };

          if (!validTimes.has(start.xAxis)) {
            start.xAxis = firstTime;
          }

          if (!validTimes.has(end.xAxis)) {
            end.xAxis = this.chartData.times[this.chartData.times.length - 1];
          }

          return [start, end];
        })
        .filter((area) => area[0] && area[1] && area[0].xAxis && area[1].xAxis);
    },

    trimChartWindow() {
      if (this.chartData.times.length <= MAX_POINTS) return;

      this.chartData.times.shift();

      METRIC_KEYS.forEach((key) => {
        this.chartData[key].orig.shift();
        this.chartData[key].ptd.shift();
        this.chartData[key].upper.shift();
        this.chartData[key].lower.shift();
        this.chartData[key].anomalies = this.chartData[key].anomalies
          .map(([idx, val]) => [idx - 1, val])
          .filter(([idx]) => idx >= 0);
      });

      this.trimWarningAreas();
    },

    appendAndRenderData(dto) {
      if (!dto || !dto.logTime) return;

      const parsedLogTime = this.parseDateTime(dto.logTime);
      const timeStr = parsedLogTime
        ? this.formatDate(parsedLogTime)
        : typeof dto.logTime === 'string'
          ? dto.logTime.replace('T', ' ')
          : this.formatDate(new Date());


      const timeIndex = this.chartData.times.length;
      this.chartData.times.push(timeStr);

      this.appendMetricPoint('spp', dto.spp, timeIndex);
      this.appendMetricPoint('flow', dto.outletFlow, timeIndex);
      this.appendMetricPoint('volume', dto.poolVolume, timeIndex);
      this.appendMetricPoint('hookload', dto.hookLoad, timeIndex);
      this.appendMetricPoint('torque', dto.torque, timeIndex);
      this.appendMetricPoint('rop', dto.rop, timeIndex);

      this.isColdStart = this.chartData.times.length < this.searchForm.shortWindow;

      this.trimChartWindow();
      this.updateCharts();

      if (dto.isKickWarning) {
        this.latestWarningMsg = dto.warningType || '预警';
        this.latestWarningType = this.latestWarningMsg.includes('一级') ? 'danger' : 'warning';

        const now = Date.now();
        if (now - this.lastWarningTime > 5000) {
          this.lastWarningTime = now;
          this.triggerWarningNotification(timeStr, this.latestWarningMsg);
        }

        const lastArea = this.chartData.kickWarningAreas[this.chartData.kickWarningAreas.length - 1];
        if (lastArea) {
          lastArea[1] = { xAxis: timeStr };
        } else {
          this.chartData.kickWarningAreas.push([
            { xAxis: timeStr, name: dto.warningType },
            { xAxis: timeStr }
          ]);
        }
      } else if (this.latestWarningMsg) {
        this.latestWarningMsg = '';
      }
    },

    updateCharts() {
      const chartMap = {
        spp: this.chartData.spp,
        flow: this.chartData.flow,
        volume: this.chartData.volume,
        hookload: this.chartData.hookload,
        torque: this.chartData.torque,
        rop: this.chartData.rop
      };

      const kickMarkArea = {
        itemStyle: { color: 'rgba(255, 77, 79, 0.12)' },
        label: {
          show: true,
          position: 'insideTop',
          color: '#c0392b',
          fontWeight: 'bold',
          backgroundColor: 'rgba(255,255,255,0.85)',
          padding: [4, 6],
          borderRadius: 4,
          offset: [0, 10]
        },
        data: this.chartData.kickWarningAreas
      };

      Object.keys(chartMap).forEach((key) => {
        const chart = this.chartInstances[key];
        if (!chart) return;

        chart.setOption({
          xAxis: { data: this.chartData.times },
          series: [
            { data: chartMap[key].orig, markArea: kickMarkArea },
            { data: chartMap[key].ptd },
            { data: chartMap[key].upper },
            { data: chartMap[key].lower },
            { data: chartMap[key].anomalies }
          ]
        });
      });
    },

    triggerWarningNotification(timeStr, warningMsg) {
      const notifyType = this.warningLevel === 2 ? 'error' : 'warning';

      Notification({
        title: this.warningLevel === 2 ? '🔴 一级预警' : '⚠️ 二级预警',
        message: `[${timeStr}] ${warningMsg}`,
        type: notifyType,
        duration: 6000,
        position: 'top-right'
      });

      if (this.warningLevel === 2) {
        this.$alert(`${warningMsg}`, '🔴 一级预警 - 溢流风险', {
          confirmButtonText: '查看详情',
          callback: (action) => {
            if (action === 'confirm') {
              this.dialogVisible = true;
            }
          }
        });
      }

      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU';
      audio.volume = 0.3;
      audio.play().catch(() => {});
    },

    async createAndStartSimulation(startTime, wellId) {
      const baseUrl = 'http://localhost:17600';
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/api/hub/monitor`)
        .withAutomaticReconnect()
        .build();

      const runId = this.activeRunId + 1;
      this.activeRunId = runId;
      this.hubConnection = connection;

      const isActiveConnection = () =>
        this.hubConnection === connection && this.activeRunId === runId;

      connection.on('ReceiveRealtimeData', (dto) => {
        if (!isActiveConnection()) return;
        this.appendAndRenderData(dto);
      });

      connection.on('SimulationFinished', async (msg) => {
        if (!isActiveConnection()) return;
        Message.success(msg);
        await this.stopSimulation(connection, { silent: true, invalidateRun: true });
      });

      connection.on('SimulationError', async (err) => {
        if (!isActiveConnection()) return;
        Message.error(`服务器错误: ${err}`);
        await this.stopSimulation(connection, { silent: true, invalidateRun: true });
      });

      connection.onclose(async (err) => {
        if (!isActiveConnection()) return;
        if (!this.isStopping && err) {
          Message.warning('监测连接已断开');
        }
        await this.stopSimulation(connection, { silent: true, invalidateRun: true });
      });

      try {
        await connection.start();

        if (!isActiveConnection()) {
          await connection.stop().catch(() => {});
          return false;
        }

        await connection.send(
          'StartRealtimeSimulationAsync',
          wellId,
          startTime,
          this.buildSimulationConfig()
        );

        if (!isActiveConnection()) {
          await connection.stop().catch(() => {});
          return false;
        }

        return true;
      } catch (err) {
        const errMsg = (err && err.message) || String(err);
        const isExpectedStopError =
          this.isStopping ||
          !isActiveConnection() ||
          errMsg.includes('Invocation canceled') ||
          errMsg.includes('underlying connection being closed') ||
          errMsg.includes('Connection disconnected');

        if (!isExpectedStopError) {
          Message.error(`连接失败: ${errMsg}`);
        }

        try {
          await connection.stop();
        } catch (e) {
          // ignore
        }

        if (this.hubConnection === connection) {
          this.hubConnection = null;
        }

        return false;
      }
    },

    async startSimulation() {
      if (!this.currentWellId || !this.searchForm.startTime) {
        Message.warning('请确认井号和起始时间');
        return;
      }

      const targetWellId = this.currentWellId;

      await this.stopSimulation(undefined, { silent: true });
      this.resetChartData();
      this.disposeCharts();

      this.isSimulating = true;
      this.isColdStart = true;
      this.hasData = true;
      this.ensureChartsReady();

      const started = await this.createAndStartSimulation(this.searchForm.startTime, targetWellId);

      if (started) {
        Message.success('流式计算模拟已启动，数据正在拉取...');
        return;
      }

      this.isSimulating = false;
      this.isColdStart = false;
      this.hasData = this.chartData.times.length > 0;
      if (!this.hasData) {
        this.disposeCharts();
      }
    },


	    async stopSimulation(connection = this.hubConnection, options = {}) {
	      // Vue v-on 默认会把 DOM 事件对象作为第一个参数传入。
	      // 这里统一兜底，避免把点击事件误当成 SignalR 连接来 stop。
	      if (connection && typeof connection.stop !== 'function') {
	        connection = this.hubConnection;
	        options = {};
	      }

	      const { silent = false, invalidateRun = true } = options;
	      const isCurrentConnection = !connection || this.hubConnection === connection;

      if (invalidateRun) {
        this.activeRunId += 1;
      }

      if (isCurrentConnection) {
        this.isStopping = true;
        this.hubConnection = null;
        this.isSimulating = false;
        this.isColdStart = false;
      }

      if (connection) {
        try {
          await connection.stop();
        } catch (e) {
          if (!silent) {
            console.warn('停止连接失败:', e);
          }
        }
      }

      if (isCurrentConnection) {
        this.isStopping = false;
      }
    },

    async handleWellChange(newVal, oldVal) {
      await this.stopSimulation(undefined, { silent: true });
      this.resetChartData();
      this.disposeCharts();
      this.hasData = false;
      this.dialogVisible = false;

      if (newVal && !oldVal && !this.searchForm.startTime) {
        this.initTimeRange();
      }
    }
  }
};
</script>


<style scoped>
.anomaly-container {
  padding: 15px;
}
.well-alert {
  margin-bottom: 15px;
}
.warning-banner {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
}
.warning-banner.warning-0 {
  background: #f0f9eb;
  color: #67C23A;
  border: 1px solid #e1f3d8;
}
.warning-banner.warning-1 {
  background: #fdf6ec;
  color: #E6A23C;
  border: 1px solid #faecd8;
  animation: pulse 2s infinite;
}
.warning-banner.warning-2 {
  background: #fef0f0;
  color: #F56C6C;
  border: 1px solid #fde2e2;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}
.chart-hint {
  padding: 10px 15px;
  background: #f4f4f5;
  border-radius: 4px;
  margin-top: 15px;
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-item-large {
  width: 100%;
  height: 350px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.logic-tree-container {
  padding: 20px;
}
.logic-result {
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  font-size: 18px;
}
.logic-result.level-0 {
  background: #f0f9eb;
  color: #67C23A;
}
.logic-result.level-1 {
  background: #fdf6ec;
  color: #E6A23C;
}
.logic-result.level-2 {
  background: #fef0f0;
  color: #F56C6C;
}
.logic-line-vertical {
  width: 2px;
  height: 20px;
  background: #409EFF;
  margin: 0 auto;
}
.logic-gate {
  text-align: center;
  padding: 10px;
  background: #ecf5ff;
  border-radius: 4px;
  color: #409EFF;
  font-weight: bold;
}
.logic-branches {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}
.logic-branch {
  display: flex;
  align-items: center;
  gap: 10px;
}
.param-box {
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #64748b;
  font-weight: bold;
}
.logic-line-horizontal {
  width: 20px;
  height: 2px;
  background: #409EFF;
}
.dir-box {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.dir-box.high {
  background: #fef0f0;
  color: #F56C6C;
}
.dir-box.low {
  background: #f0f9eb;
  color: #67C23A;
}
.dir-box.none {
  background: #f4f4f5;
  color: #909399;
}
.logic-explanation {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}
.safe-result {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #67C23A;
}
.dialog-2 .el-dialog__header {
  background: #F56C6C;
  color: white;
}
.dialog-1 .el-dialog__header {
  background: #E6A23C;
  color: white;
}
</style>

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

        <el-form-item label="回放速率" class="speed-form-item">
          <el-radio-group
            v-model="searchForm.playbackSpeed"
            size="small"
            @change="handlePlaybackSpeedChange">
            <el-radio-button
              v-for="speed in playbackSpeedOptions"
              :key="speed"
              :label="speed">
              {{ formatPlaybackSpeedLabel(speed) }}
            </el-radio-button>
          </el-radio-group>
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

      <div v-if="hasData" class="speed-status-row">
        <el-tag size="small" type="info" effect="plain">当前回放速率 {{ currentPlaybackSpeedLabel }}</el-tag>
        <span class="speed-status-text">
          历史数据模拟按 {{ currentPlaybackSpeedLabel }} 推送，倍速越高，六条曲线刷新越快。
        </span>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="860px" :class="'dialog-' + warningLevel">
      <div v-if="alertPanelVisible" class="popup-alert-body">
        <div class="alert-panel-shell">
          <div class="evidence-alert-banner">
            <div class="evidence-alert-main">
              <div class="evidence-alert-kicker">{{ alertStateText }}</div>
              <div class="evidence-alert-title">{{ alertHeadline }}</div>
              <div class="evidence-alert-desc">{{ alertDescription }}</div>
            </div>
            <div class="evidence-alert-meta">
              <span class="evidence-meta-pill">异常参数 {{ anomalyMetricCount }}/{{ evidenceRows.length }}</span>
              <span class="evidence-meta-pill">井深 {{ latestDepthText }}</span>
              <span class="evidence-meta-pill">{{ latestDrillingConditionText }}</span>
            </div>
          </div>

          <div class="evidence-table-wrap">
            <div class="evidence-table-head">
              <div>
                <div class="evidence-table-title">机理证据链</div>
                <div class="evidence-table-subtitle">只要后端任一核心参数返回 `isAnomaly = true`，这里就会联动展示越界证据。</div>
              </div>
              <div class="evidence-table-legend">
                <span class="legend-dot legend-danger"></span>
                <span>红色行为越界参数</span>
              </div>
            </div>

            <el-table
              :data="evidenceRows"
              border
              size="small"
              :row-style="getEvidenceRowStyle"
              class="evidence-table">
              <el-table-column label="监测参数" min-width="180">
                <template slot-scope="{ row }">
                  <div class="metric-cell">
                    <span class="metric-label">{{ row.label }}</span>
                    <span class="metric-unit">{{ row.unit }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="实时原值" width="120" align="center">
                <template slot-scope="{ row }">
                  {{ formatNumber(row.originalValue, row.precision) }}
                </template>
              </el-table-column>

              <el-table-column label="PTD偏离" width="120" align="center">
                <template slot-scope="{ row }">
                  <span :class="row.isAnomaly ? 'ptd-text-danger' : 'ptd-text-normal'">
                    {{ formatNumber(row.ptdValue, 4) }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="MAD动态阈值" min-width="190" align="center">
                <template slot-scope="{ row }">
                  <span class="threshold-chip">
                    [ {{ formatNumber(row.lowerThreshold, 4) }} , {{ formatNumber(row.upperThreshold, 4) }} ]
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="机理方向" width="110" align="center">
                <template slot-scope="{ row }">
                  <span class="direction-pill" :class="`direction-${row.directionClass}`">
                    <i :class="row.directionIcon"></i>
                    {{ row.directionText }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="判定" width="110" align="center">
                <template slot-scope="{ row }">
                  <el-tag :type="row.isAnomaly ? 'danger' : 'success'" size="small" effect="dark">
                    {{ row.isAnomaly ? '越界告警' : '区间内' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <div class="logic-tree-container" v-if="latestWarningMsg">
        <div class="logic-result" :class="'level-' + warningLevel">
          <i :class="warningLevel >= 2 ? 'el-icon-warning' : 'el-icon-info'"></i> 
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
const PLAYBACK_SPEED_OPTIONS = [1, 2, 5, 10];
const METRIC_DEFINITIONS = [
  { chartKey: 'spp', dtoKey: 'spp', label: '立压 SPP', unit: 'MPa', precision: 2 },
  { chartKey: 'flow', dtoKey: 'outletFlow', label: '出口流量 Flow', unit: '%', precision: 2 },
  { chartKey: 'volume', dtoKey: 'poolVolume', label: '总池体积 Volume', unit: 'm³', precision: 2 },
  { chartKey: 'hookload', dtoKey: 'hookLoad', label: '钩载 HKLA', unit: 'kN', precision: 2 },
  { chartKey: 'torque', dtoKey: 'torque', label: '扭矩 Torque', unit: 'kN.m', precision: 2 },
  { chartKey: 'rop', dtoKey: 'rop', label: '钻时 ROP', unit: 'min/m', precision: 2 }
];

const ALERT_DURATION_RULES = {
  level3MinSeconds: 45,
  level2MinSeconds: 60,
  level1MinSeconds: 30
};

const RISK_TREE_KNOWLEDGE_BASE = {
  溢流动态前兆: {
    desc: '第四章 W1 井结论强调，立压、扭矩、钩载、钻时在关键窗口内同步突破阈值，才能从压力、力学与破岩作用多维机理上验证放空前兆。',
    conditions: [
      { name: '立压', icon: '⏱️', dir: 'low', text: '突破下限' },
      { name: '扭矩', icon: '⚙️', dir: 'low', text: '突破下限' },
      { name: '钻时', icon: '⛏️', dir: 'low', text: '突破下限' },
      { name: '钩载', icon: '🏗️', dir: 'high', text: '突破上限' }
    ]
  },
  气侵溢流: {
    desc: '风险树中“立压下降 + 出口流量增加 + 总池体积增加”对应气侵溢流，需要把单参数波动与多参数协同异常区分开。',
    conditions: [
      { name: '立压', icon: '⏱️', dir: 'low', text: '突破下限' },
      { name: '出口流量', icon: '🌊', dir: 'high', text: '突破上限' },
      { name: '总池体积', icon: '🛢️', dir: 'high', text: '突破上限' }
    ]
  },
  后期溢流: {
    desc: '风险树指出，立压趋于稳定后若出口流量与总池体积仍持续增加，应视作后期溢流而非偶发单点异常。',
    conditions: [
      { name: '立压', icon: '⏱️', dir: 'none', text: '保持稳定' },
      { name: '出口流量', icon: '🌊', dir: 'high', text: '突破上限' },
      { name: '总池体积', icon: '🛢️', dir: 'high', text: '突破上限' }
    ]
  },
  多参数协同异常: {
    desc: '第四章强调，多参数同时偏离动态阈值，才能有效排除传感器误差或单一地层块扰动带来的假异常。',
    conditions: []
  },
  单参数持续异常: {
    desc: '单参数瞬时越界不应直接归入预警；只有持续一段时间后，才按三级关注级处理并继续观察是否演化为协同异常。',
    conditions: []
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
        kFactor: 3.0,
        playbackSpeed: 1
      },
      isSimulating: false,
      isColdStart: false,
      hasData: false,
      latestWarningMsg: '',
      latestWarningType: '',
      latestAlertType: '',
      dialogVisible: false,
      hubConnection: null,
      latestRealtimeDto: null,
      activeAlertSegment: null,
      currentAlertSeverity: 0,
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
    playbackSpeedOptions() {
      return PLAYBACK_SPEED_OPTIONS;
    },
    warningLevel() {
      return this.currentAlertSeverity;
    },
    evidenceRows() {
      return this.getEvidenceRows(this.latestRealtimeDto);
    },
    anomalyMetricCount() {
      return this.evidenceRows.filter((row) => row.isAnomaly).length;
    },
    alertPanelVisible() {
      return this.warningLevel > 0;
    },
    alertStateText() {
      if (this.warningLevel === 3) return '一级预警';
      if (this.warningLevel === 2) return '二级预警';
      if (this.warningLevel === 1) return '三级预警';
      return '实时参数告警';
    },
    alertHeadline() {
      if (this.latestWarningMsg) {
        return this.latestWarningMsg;
      }

      const labels = this.evidenceRows
        .filter((row) => row.isAnomaly)
        .map((row) => row.label.replace(/\s+[A-Z]+$/, ''));

      if (labels.length === 0) {
        return '井筒状态正常';
      }

      return `检测到 ${labels.length} 项核心参数突破动态阈值：${labels.join('、')}`;
    },
    alertDescription() {
      return '预警按照第四章的风险树思路，综合连续时长、超阈倍数和多参数协同性后再触发；单点异常不直接计入预警，当前采用 30s / 45s / 60s 的持续窗口分级。';
    },
    latestDepthText() {
      if (!this.latestRealtimeDto || this.latestRealtimeDto.depth === null || this.latestRealtimeDto.depth === undefined) {
        return '--';
      }
      return `${this.formatNumber(this.latestRealtimeDto.depth, 2)} m`;
    },
    latestDrillingConditionText() {
      return this.latestRealtimeDto && this.latestRealtimeDto.drillingCondition
        ? this.latestRealtimeDto.drillingCondition
        : '工况未返回';
    },
    dialogTitle() {
      if (this.warningLevel === 3) return '🔴 一级预警';
      if (this.warningLevel === 2) return '⚠️ 二级预警';
      if (this.warningLevel === 1) return '🔎 三级预警';
      return '综合异常诊断';
    },
    currentPlaybackSpeedLabel() {
      return this.formatPlaybackSpeedLabel(this.searchForm.playbackSpeed);
    },
    activeConditions() {
      if (!this.latestAlertType) return [];

      const preset = RISK_TREE_KNOWLEDGE_BASE[this.latestAlertType];
      if (preset && preset.conditions && preset.conditions.length > 0) {
        return preset.conditions;
      }

      return this.evidenceRows
        .filter((row) => row.isAnomaly)
        .map((row) => ({
          name: row.label,
          icon: row.direction > 0 ? '↑' : row.direction < 0 ? '↓' : '·',
          dir: row.direction > 0 ? 'high' : row.direction < 0 ? 'low' : 'none',
          text: row.direction > 0 ? '突破上限' : row.direction < 0 ? '突破下限' : '保持稳定'
        }));
    },
    activeDescription() {
      if (!this.latestAlertType) return '';
      return (RISK_TREE_KNOWLEDGE_BASE[this.latestAlertType] || {}).desc || '';
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
        kFactor: this.searchForm.kFactor,
        playbackSpeed: Number(this.searchForm.playbackSpeed) || 1
      });
    },

    formatPlaybackSpeedLabel(speed) {
      const normalizedSpeed = Number(speed) || 1;
      return `${normalizedSpeed}x`;
    },

    async handlePlaybackSpeedChange(value) {
      const nextSpeed = Number(value) || 1;
      this.searchForm.playbackSpeed = nextSpeed;

      const connection = this.hubConnection;
      const isConnected =
        connection &&
        connection.state === signalR.HubConnectionState.Connected;

      if (!this.isSimulating || !isConnected) {
        Message.success(`回放速率已切换为 ${this.formatPlaybackSpeedLabel(nextSpeed)}，下次启动立即生效`);
        return;
      }

      try {
        await connection.send('UpdateSimulationSpeedAsync', nextSpeed);
        Message.success(`回放速率已切换为 ${this.formatPlaybackSpeedLabel(nextSpeed)}`);
      } catch (err) {
        const errMsg = (err && err.message) || String(err);
        Message.error(`速率切换失败: ${errMsg}`);
      }
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
      this.latestAlertType = '';
      this.latestRealtimeDto = null;
      this.activeAlertSegment = null;
      this.currentAlertSeverity = 0;
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
        grid: { left: '78px', right: '82px', bottom: '45px', top: '75px' },
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
            nameLocation: 'middle',
            nameGap: 36,
            scale: true,
            inverse: isInverse,
            axisLabel: { color },
            splitLine: { show: false }
          },
          {
            type: 'value',
            name: 'PTD基线',
            nameLocation: 'middle',
            nameGap: 40,
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

    getEvidenceRows(dto) {
      return METRIC_DEFINITIONS.map((metric) => {
        const source = dto && dto[metric.dtoKey] ? dto[metric.dtoKey] : {};
        const direction = this.normalizeDirection(source.direction);
        const isAnomaly = Boolean(source.isAnomaly);

        return {
          ...metric,
          originalValue: source.originalValue,
          ptdValue: source.ptdValue,
          upperThreshold: source.upperThreshold,
          lowerThreshold: source.lowerThreshold,
          isAnomaly,
          direction,
          directionText: direction > 0 ? '上冲' : direction < 0 ? '下探' : '稳定',
          directionClass: direction > 0 ? 'high' : direction < 0 ? 'low' : 'steady',
          directionIcon: direction > 0 ? 'el-icon-top' : direction < 0 ? 'el-icon-bottom' : 'el-icon-right'
        };
      });
    },

    formatAlertLevelLabel(level) {
      if (level === 3) return '一级预警';
      if (level === 2) return '二级预警';
      if (level === 1) return '三级预警';
      return '';
    },

    getAlertLevelType(level) {
      if (level === 3) return 'error';
      if (level === 2) return 'warning';
      if (level === 1) return 'info';
      return 'info';
    },

    getRowThresholdMagnitude(row) {
      const halfBand = Math.abs((row.upperThreshold || 0) - (row.lowerThreshold || 0)) / 2;
      return Math.max(
        Math.abs(row.upperThreshold || 0),
        Math.abs(row.lowerThreshold || 0),
        halfBand,
        1e-3
      );
    },

    getRowAlertRatio(row) {
      if (!row || !row.isAnomaly) return 0;
      return Math.abs(row.ptdValue || 0) / this.getRowThresholdMagnitude(row);
    },

    getRiskTypePriority(type) {
      const priorityMap = {
        溢流动态前兆: 5,
        气侵溢流: 4,
        后期溢流: 3,
        多参数协同异常: 2,
        单参数持续异常: 1
      };

      return priorityMap[type] || 0;
    },

    evaluateAlertPoint(dto) {
      const rows = this.getEvidenceRows(dto);
      const anomalyRows = rows.filter((row) => row.isAnomaly);

      if (anomalyRows.length === 0) {
        return null;
      }

      const rowMap = rows.reduce((acc, row) => {
        acc[row.dtoKey] = row;
        return acc;
      }, {});

      const hasSppLow = rowMap.spp && rowMap.spp.isAnomaly && rowMap.spp.direction < 0;
      const hasFlowHigh = rowMap.outletFlow && rowMap.outletFlow.isAnomaly && rowMap.outletFlow.direction > 0;
      const hasVolumeHigh = rowMap.poolVolume && rowMap.poolVolume.isAnomaly && rowMap.poolVolume.direction > 0;
      const hasTorqueLow = rowMap.torque && rowMap.torque.isAnomaly && rowMap.torque.direction < 0;
      const hasRopLow = rowMap.rop && rowMap.rop.isAnomaly && rowMap.rop.direction < 0;
      const hasHookHigh = rowMap.hookLoad && rowMap.hookLoad.isAnomaly && rowMap.hookLoad.direction > 0;

      let riskType = '单参数持续异常';
      if (hasSppLow && hasTorqueLow && hasRopLow && hasHookHigh) {
        riskType = '溢流动态前兆';
      } else if (hasSppLow && hasFlowHigh && hasVolumeHigh) {
        riskType = '气侵溢流';
      } else if ((!rowMap.spp || !rowMap.spp.isAnomaly) && hasFlowHigh && hasVolumeHigh) {
        riskType = '后期溢流';
      } else if (anomalyRows.length >= 2) {
        riskType = '多参数协同异常';
      }

      const ratios = anomalyRows.map((row) => this.getRowAlertRatio(row));
      const maxRatio = ratios.length > 0 ? Math.max(...ratios) : 0;
      const abrupt = maxRatio >= 3 || (hasRopLow && rowMap.rop && Number(rowMap.rop.originalValue || 0) <= 0.01);

      return {
        riskType,
        anomalyRows,
        anomalyCount: anomalyRows.length,
        maxRatio,
        abrupt,
        structuredRisk: ['溢流动态前兆', '气侵溢流', '后期溢流'].includes(riskType)
      };
    },

    createAlertSegment(point, pointTs, timeStr) {
      return {
        startTs: pointTs,
        lastTs: pointTs,
        startTimeStr: timeStr,
        lastTimeStr: timeStr,
        pointCount: 1,
        maxRatio: point.maxRatio,
        maxAnomalyCount: point.anomalyCount,
        abrupt: point.abrupt,
        structuredRisk: point.structuredRisk,
        primaryType: point.riskType,
        highestNotifiedLevel: 0,
        areaIndex: -1
      };
    },

    updateAlertSegment(segment, point, pointTs, timeStr) {
      segment.lastTs = pointTs;
      segment.lastTimeStr = timeStr;
      segment.pointCount += 1;
      segment.maxRatio = Math.max(segment.maxRatio, point.maxRatio);
      segment.maxAnomalyCount = Math.max(segment.maxAnomalyCount, point.anomalyCount);
      segment.abrupt = segment.abrupt || point.abrupt;
      segment.structuredRisk = segment.structuredRisk || point.structuredRisk;

      if (this.getRiskTypePriority(point.riskType) >= this.getRiskTypePriority(segment.primaryType)) {
        segment.primaryType = point.riskType;
      }
    },

    computeSegmentSeverity(segment) {
      const durationSeconds = segment.pointCount * 10;

      if (
        durationSeconds >= ALERT_DURATION_RULES.level1MinSeconds &&
        (segment.abrupt || segment.maxRatio >= 3 || (segment.primaryType === '溢流动态前兆' && segment.maxAnomalyCount >= 4))
      ) {
        return 3;
      }

      if (
        durationSeconds >= ALERT_DURATION_RULES.level2MinSeconds &&
        (segment.maxRatio >= 2 || segment.maxAnomalyCount >= 2 || segment.structuredRisk)
      ) {
        return 2;
      }

      if (durationSeconds >= ALERT_DURATION_RULES.level3MinSeconds) {
        return 1;
      }

      return 0;
    },

    syncAlertArea(segment, level, timeStr) {
      if (!segment) return;

      if (level <= 0) {
        return;
      }

      const levelLabel = this.formatAlertLevelLabel(level);

      if (segment.areaIndex === -1) {
        this.chartData.kickWarningAreas.push([
          { xAxis: segment.startTimeStr, name: levelLabel },
          { xAxis: timeStr }
        ]);
        segment.areaIndex = this.chartData.kickWarningAreas.length - 1;
        return;
      }

      const area = this.chartData.kickWarningAreas[segment.areaIndex];
      if (!area) return;

      area[0].name = levelLabel;
      area[1] = { xAxis: timeStr };
    },

    clearCurrentAlertState() {
      this.activeAlertSegment = null;
      this.currentAlertSeverity = 0;
      this.latestAlertType = '';
      this.latestWarningMsg = '';
      this.latestWarningType = '';
      this.dialogVisible = false;
    },

    pickPayloadValue(source, keys, fallback = null) {
      if (!source || typeof source !== 'object') return fallback;

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined && source[key] !== null) {
          return source[key];
        }
      }

      return fallback;
    },

    normalizeNumber(value, fallback = null) {
      if (value === undefined || value === null || value === '') return fallback;
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    },

    normalizeBoolean(value) {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return Boolean(value);
    },

    normalizeDirection(value) {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return value > 0 ? 1 : value < 0 ? -1 : 0;

      const text = String(value).toLowerCase();
      if (text === 'high') return 1;
      if (text === 'low') return -1;
      return 0;
    },

    normalizeSeverity(value) {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return value;

      const text = String(value).toLowerCase();
      if (text === 'level1') return 3;
      if (text === 'level2') return 2;
      if (text === 'observation') return 1;
      return 0;
    },

    normalizeMetricDto(source) {
      if (!source || typeof source !== 'object') return null;

      return {
        originalValue: this.normalizeNumber(this.pickPayloadValue(source, ['originalValue', 'OriginalValue'])),
        ptdValue: this.normalizeNumber(this.pickPayloadValue(source, ['ptdValue', 'PtdValue']), 0),
        upperThreshold: this.normalizeNumber(this.pickPayloadValue(source, ['upperThreshold', 'UpperThreshold']), 0),
        lowerThreshold: this.normalizeNumber(this.pickPayloadValue(source, ['lowerThreshold', 'LowerThreshold']), 0),
        isAnomaly: this.normalizeBoolean(this.pickPayloadValue(source, ['isAnomaly', 'IsAnomaly'], false)),
        direction: this.normalizeDirection(this.pickPayloadValue(source, ['direction', 'Direction'], 0))
      };
    },

    normalizeRealtimeDto(payload) {
      if (!payload || typeof payload !== 'object') return null;

      return {
        logTime: this.pickPayloadValue(payload, ['logTime', 'LogTime']),
        depth: this.normalizeNumber(this.pickPayloadValue(payload, ['depth', 'Depth'])),
        poolVolume: this.normalizeMetricDto(this.pickPayloadValue(payload, ['poolVolume', 'PoolVolume'])),
        outletFlow: this.normalizeMetricDto(this.pickPayloadValue(payload, ['outletFlow', 'OutletFlow'])),
        spp: this.normalizeMetricDto(this.pickPayloadValue(payload, ['spp', 'Spp'])),
        hookLoad: this.normalizeMetricDto(this.pickPayloadValue(payload, ['hookLoad', 'HookLoad'])),
        rop: this.normalizeMetricDto(this.pickPayloadValue(payload, ['rop', 'Rop'])),
        torque: this.normalizeMetricDto(this.pickPayloadValue(payload, ['torque', 'Torque'])),
        isKickWarning: this.normalizeBoolean(this.pickPayloadValue(payload, ['isKickWarning', 'IsKickWarning'], false)),
        warningType: this.pickPayloadValue(payload, ['warningType', 'WarningType'], ''),
        severity: this.normalizeSeverity(this.pickPayloadValue(payload, ['severity', 'Severity'], 0)),
        drillingCondition: this.pickPayloadValue(payload, ['drillingCondition', 'DrillingCondition'], ''),
        sopActions: this.pickPayloadValue(payload, ['sopActions', 'SopActions'], [])
      };
    },

    dtoHasAnyAnomaly(dto) {
      return METRIC_DEFINITIONS.some((metric) => dto && dto[metric.dtoKey] && dto[metric.dtoKey].isAnomaly);
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

    appendAndRenderData(payload) {
      const dto = this.normalizeRealtimeDto(payload);
      if (!dto) return;

      this.latestRealtimeDto = dto;

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

      const pointTs = parsedLogTime ? parsedLogTime.getTime() : Date.now();
      const pointAlert = this.evaluateAlertPoint(dto);

      if (!pointAlert) {
        this.clearCurrentAlertState();
        this.updateCharts();
        return;
      }

      const canContinueSegment =
        this.activeAlertSegment &&
        pointTs - this.activeAlertSegment.lastTs <= 30000;

      if (!canContinueSegment) {
        this.activeAlertSegment = this.createAlertSegment(pointAlert, pointTs, timeStr);
      } else {
        this.updateAlertSegment(this.activeAlertSegment, pointAlert, pointTs, timeStr);
      }

      const severity = this.computeSegmentSeverity(this.activeAlertSegment);
      this.currentAlertSeverity = severity;
      this.latestAlertType = this.activeAlertSegment.primaryType;
      this.latestWarningMsg = severity > 0
        ? `${this.formatAlertLevelLabel(severity)}：${this.latestAlertType}`
        : '';
      this.latestWarningType = this.getAlertLevelType(severity);
      this.dialogVisible = severity === 3;

      this.syncAlertArea(this.activeAlertSegment, severity, timeStr);
      this.updateCharts();

      if (severity > this.activeAlertSegment.highestNotifiedLevel) {
        this.triggerWarningNotification(timeStr, this.latestWarningMsg, severity);
        this.activeAlertSegment.highestNotifiedLevel = severity;
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

    triggerWarningNotification(timeStr, warningMsg, severity) {
      if (severity === 3) {
        this.dialogVisible = true;
      } else if (severity > 0) {
        Notification({
          title: this.formatAlertLevelLabel(severity),
          message: `[${timeStr}] ${warningMsg}`,
          type: this.getAlertLevelType(severity),
          duration: severity === 2 ? 7000 : 5000,
          position: 'top-right'
        });
      }

      if (severity >= 2) {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU';
        audio.volume = severity === 3 ? 0.35 : 0.22;
        audio.play().catch(() => {});
      }
    },

    getEvidenceRowStyle({ row }) {
      if (!row.isAnomaly) {
        return {
          backgroundColor: '#fff'
        };
      }

      return {
        background: 'linear-gradient(90deg, rgba(255, 233, 233, 0.95), rgba(255, 246, 246, 0.95))'
      };
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
          if (connection.state === signalR.HubConnectionState.Connected) {
            await connection.send('StopRealtimeSimulationAsync').catch(() => {});
          }
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
    },

    formatNumber(val, decimals = 2) {
      if (val === undefined || val === null || val === '') return '--';
      const num = Number(val);
      if (!Number.isFinite(num)) return '--';
      return num.toFixed(decimals);
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
.speed-form-item ::v-deep .el-radio-button__inner {
  min-width: 54px;
  text-align: center;
}
.speed-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #4b5563;
  font-size: 13px;
}
.speed-status-text {
  line-height: 1.5;
}
.chart-item-large {
  width: 100%;
  height: 350px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.popup-alert-body {
  margin-bottom: 18px;
}
.alert-panel-shell {
  margin-top: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #fecaca;
  box-shadow: 0 20px 36px rgba(185, 28, 28, 0.18);
  background: #fff7f7;
}
.evidence-alert-banner {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  color: #fff;
  background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 46%, #ef4444 100%);
}
.evidence-alert-main {
  min-width: 0;
}
.evidence-alert-kicker {
  margin-bottom: 8px;
  font-size: 12px;
  letter-spacing: 1.6px;
  opacity: 0.88;
  text-transform: uppercase;
}
.evidence-alert-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
}
.evidence-alert-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}
.evidence-alert-meta {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-end;
  gap: 8px;
  min-width: 220px;
}
.evidence-meta-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  font-size: 12px;
  white-space: nowrap;
}
.evidence-table-wrap {
  padding: 18px 18px 20px;
}
.evidence-table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.evidence-table-title {
  color: #7f1d1d;
  font-size: 18px;
  font-weight: 700;
}
.evidence-table-subtitle {
  margin-top: 4px;
  color: #7f1d1d;
  opacity: 0.78;
  font-size: 13px;
}
.evidence-table-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #991b1b;
  font-size: 12px;
  white-space: nowrap;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.legend-danger {
  background: #ef4444;
}
.evidence-table {
  border-radius: 12px;
  overflow: hidden;
}
.metric-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.metric-label {
  color: #1f2937;
  font-weight: 600;
}
.metric-unit {
  color: #6b7280;
  font-size: 12px;
}
.threshold-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 999px;
  background: #fff1f2;
  color: #9f1239;
  font-family: Consolas, monospace;
  font-size: 12px;
}
.direction-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.direction-high {
  background: #fee2e2;
  color: #b91c1c;
}
.direction-low {
  background: #fff7ed;
  color: #c2410c;
}
.direction-steady {
  background: #f3f4f6;
  color: #4b5563;
}
.ptd-text-danger {
  color: #dc2626;
  font-weight: 700;
}
.ptd-text-normal {
  color: #475569;
}
.alert-panel-slide-enter-active,
.alert-panel-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.alert-panel-slide-enter,
.alert-panel-slide-leave-to {
  opacity: 0;
  transform: translateY(28px);
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
.logic-result.level-3 {
  background: #fef0f0;
  color: #F56C6C;
}
.logic-result.level-1 {
  background: #ecf5ff;
  color: #409EFF;
}
.logic-result.level-2 {
  background: #fdf6ec;
  color: #E6A23C;
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
.dialog-3 .el-dialog__header {
  background: #F56C6C;
  color: white;
}
.dialog-2 .el-dialog__header {
  background: #E6A23C;
  color: white;
}
.dialog-1 .el-dialog__header {
  background: #409EFF;
  color: white;
}
@media (max-width: 900px) {
  .evidence-alert-banner {
    flex-direction: column;
  }

  .evidence-alert-meta {
    justify-content: flex-start;
    min-width: 0;
  }

  .evidence-table-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

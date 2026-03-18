<template>
  <div class="ptd-dashboard">
    <div v-if="!hasData && !loading" class="empty-box">
      <i class="el-icon-data-analysis"></i>
      <div>{{ emptyText }}</div>
    </div>

    <template v-else>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="summary-card">
            <div class="summary-label">{{ pageModeLabel }}</div>
            <div class="summary-value">
              <el-tag size="small" effect="dark" :type="latestSeverityMeta.tagType">{{ latestSeverityMeta.code }}</el-tag>
              <span>{{ latestFrame ? latestFrame.riskType : '暂无风险事件' }}</span>
            </div>
            <div class="summary-meta">
              <span>井号 {{ currentWellId || '-' }}</span>
              <span>工况 {{ latestFrame ? (latestFrame.activityBucket || latestFrame.activityCode || '-') : '-' }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="summary-card">
            <div class="summary-label">采样与配置</div>
            <div class="summary-value">配置版本 {{ configVersion || '-' }}</div>
            <div class="summary-meta">
              <span>样本 {{ samplingView.sampleCount || 0 }}</span>
              <span>均值 {{ formatNumber(samplingView.averageIntervalSec, 3) }}s</span>
              <span>主频 {{ formatNumber(samplingView.dominantIntervalSec, 3) }}s</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="summary-card">
            <div class="summary-label">事件态势</div>
            <div class="summary-value">事件 {{ events.length }} 个</div>
            <div class="summary-meta">
              <span>L1 {{ severityCounts.L1 }}</span>
              <span>L2 {{ severityCounts.L2 }}</span>
              <span>L3 {{ severityCounts.L3 }}</span>
              <span>默认视窗 {{ defaultWindowMinutes }}min</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-card v-if="showHighlightCard" shadow="never" class="focus-card">
        <div class="focus-head">
          <div>
            <div class="summary-label">重点事件</div>
            <div class="summary-value">
              <el-tag size="small" effect="dark" :type="highlightSeverityMeta.tagType">{{ highlightSeverityMeta.code }}</el-tag>
              <span>{{ highlightEvent.riskType }}</span>
            </div>
            <div class="summary-meta">
              <span>{{ highlightEvent.startTimeLabel }}</span>
              <span>{{ highlightEvent.endTimeLabel }}</span>
              <span>{{ formatDuration(highlightEvent.durationSec) }}</span>
              <span>{{ getStatusMetaFor(highlightEvent.status).label }}</span>
            </div>
          </div>
          <div class="action-row">
            <el-button size="mini" type="primary" @click="jumpToEvent(highlightEvent)">定位区间</el-button>
            <el-button size="mini" @click="openEventDetail(highlightEvent)">查看证据</el-button>
          </div>
        </div>
      </el-card>

      <el-card v-for="layout in chartLayouts" :key="layout.key" shadow="never" class="chart-card chart-panel" :body-style="{ padding: '0' }">
        <div :ref="layout.ref" class="chart-canvas"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <div slot="header" class="chart-head">
          <span>异常事件闭环</span>
          <span>{{ showEventActions ? '支持按类型折叠分组，并可查看证据或定位对应时间段' : '支持按类型折叠分组并查看统一闭环状态' }}</span>
        </div>

        <el-collapse v-if="groupEvents && groupedEventGroups.length" v-model="expandedGroupNames">
          <el-collapse-item v-for="group in groupedEventGroups" :key="group.name" :name="group.name">
            <template slot="title">
              <div class="group-title-row">
                <span class="group-title">{{ group.name }}</span>
                <div class="group-meta">
                  <el-tag size="mini" effect="dark" :type="getSeverityMetaFor(group.maxSeverityCode, group.maxSeverityLevel).tagType">{{ group.maxSeverityCode }}</el-tag>
                  <span>{{ group.events.length }} 个</span>
                </div>
              </div>
            </template>
            <el-table :data="group.events" border stripe size="small" :row-class-name="getEventRowClassName">
              <el-table-column label="等级" width="90" align="center">
                <template slot-scope="{ row }">
                  <el-tag size="small" effect="dark" :type="getSeverityMetaFor(row.severity, row.severityLevel).tagType">{{ row.severity }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startTimeLabel" label="开始时间" :min-width="showEventActions ? 170 : 230" />
              <el-table-column prop="endTimeLabel" label="结束时间" :min-width="showEventActions ? 170 : 230" />
              <el-table-column label="持续时长" :min-width="showEventActions ? 110 : 150" align="center">
                <template slot-scope="{ row }">{{ formatDuration(row.durationSec) }}</template>
              </el-table-column>
              <el-table-column label="状态" :min-width="showEventActions ? 110 : 150" align="center">
                <template slot-scope="{ row }">
                  <el-tag size="small" effect="plain" :type="getStatusMetaFor(row.status).type">{{ getStatusMetaFor(row.status).label }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="showEventActions" label="操作" min-width="240">
                <template slot-scope="{ row }">
                  <el-button size="mini" type="text" @click="jumpToEvent(row)">定位</el-button>
                  <el-button size="mini" type="text" @click="openEventDetail(row)">证据</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'ACKNOWLEDGED'" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'PROCESSING'" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'CLOSED'" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>

        <el-table v-else :data="sortedEvents" border stripe size="small" :row-class-name="getEventRowClassName">
          <el-table-column label="等级" width="90" align="center">
            <template slot-scope="{ row }">
              <el-tag size="small" effect="dark" :type="getSeverityMetaFor(row.severity, row.severityLevel).tagType">{{ row.severity }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="riskType" label="风险类型" min-width="200" />
          <el-table-column prop="startTimeLabel" label="开始时间" :min-width="showEventActions ? 170 : 220" />
          <el-table-column prop="endTimeLabel" label="结束时间" :min-width="showEventActions ? 170 : 220" />
          <el-table-column label="持续时长" :min-width="showEventActions ? 110 : 140" align="center">
            <template slot-scope="{ row }">{{ formatDuration(row.durationSec) }}</template>
          </el-table-column>
          <el-table-column label="状态" :min-width="showEventActions ? 110 : 140" align="center">
            <template slot-scope="{ row }">
              <el-tag size="small" effect="plain" :type="getStatusMetaFor(row.status).type">{{ getStatusMetaFor(row.status).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="showEventActions" label="操作" min-width="240">
            <template slot-scope="{ row }">
              <el-button size="mini" type="text" @click="jumpToEvent(row)">定位</el-button>
              <el-button size="mini" type="text" @click="openEventDetail(row)">证据</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'ACKNOWLEDGED'" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'PROCESSING'" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'CLOSED'" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <el-dialog :visible.sync="detailVisible" width="960px" :title="selectedEvent ? `事件详情 - ${selectedEvent.riskType}` : '事件详情'">
      <template v-if="selectedEvent">
        <div class="summary-meta dialog-meta">
          <el-tag size="small" effect="dark" :type="getSeverityMetaFor(selectedEvent.severity, selectedEvent.severityLevel).tagType">{{ selectedEvent.severity }}</el-tag>
          <el-tag size="small" effect="plain" :type="getStatusMetaFor(selectedEvent.status).type">{{ getStatusMetaFor(selectedEvent.status).label }}</el-tag>
          <span>{{ selectedEvent.startTimeLabel }}</span>
          <span>{{ selectedEvent.endTimeLabel }}</span>
          <span>{{ formatDuration(selectedEvent.durationSec) }}</span>
        </div>
        <div v-if="showEventActions || allowStatusUpdate" class="action-row dialog-actions">
          <el-button size="mini" type="primary" @click="jumpToEvent(selectedEvent)">定位区间</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="warning" :disabled="isStatusBusy(selectedEvent.eventId) || selectedEvent.status === 'ACKNOWLEDGED'" @click="updateStatus(selectedEvent, 'ACKNOWLEDGED')">确认</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="info" :disabled="isStatusBusy(selectedEvent.eventId) || selectedEvent.status === 'PROCESSING'" @click="updateStatus(selectedEvent, 'PROCESSING')">处理中</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="success" :disabled="isStatusBusy(selectedEvent.eventId) || selectedEvent.status === 'CLOSED'" @click="updateStatus(selectedEvent, 'CLOSED')">关闭</el-button>
        </div>
        <el-table :data="selectedEvent.evidence" border size="small">
          <el-table-column prop="label" label="证据项" min-width="180" />
          <el-table-column label="方向" width="90" align="center">
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="directionTagType(row.direction)">{{ directionText(row.direction) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="当前值" width="110" align="center">
            <template slot-scope="{ row }">{{ formatNumber(row.value, 3) }}</template>
          </el-table-column>
          <el-table-column label="基线" width="110" align="center">
            <template slot-scope="{ row }">{{ formatNumber(row.baseline, 3) }}</template>
          </el-table-column>
          <el-table-column label="阈值" width="110" align="center">
            <template slot-scope="{ row }">{{ formatNumber(row.threshold, 3) }}</template>
          </el-table-column>
          <el-table-column label="倍数" width="90" align="center">
            <template slot-scope="{ row }">{{ formatNumber(row.ratio, 3) }}</template>
          </el-table-column>
          <el-table-column label="窗口(s)" width="90" align="center">
            <template slot-scope="{ row }">{{ formatNumber(row.windowSec, 0) }}</template>
          </el-table-column>
          <el-table-column prop="note" label="说明" min-width="220" />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { updatePtdEventStatusApi } from '@/api/index';
import { formatDateTime, formatDuration, formatNumber, getSeverityMeta, getStatusMeta } from '@/utils/ptdRisk';

const CHART_LAYOUTS = [
  { key: 'overview', ref: 'chartOverview', title: '风险等级曲线', type: 'overview' },
  { key: 'standpipePress', ref: 'chartSpp', title: '立管压力 SPPA', type: 'metric', metricKey: 'standpipePress', color: '#0f766e' },
  { key: 'outletFlow', ref: 'chartFlow', title: '出口流量 MFOA', type: 'metric', metricKey: 'outletFlow', color: '#2563eb' },
  { key: 'poolVolume', ref: 'chartVolume', title: '总池体积 TVOLACT', type: 'metric', metricKey: 'poolVolume', color: '#7c3aed' },
  { key: 'hookLoad', ref: 'chartHook', title: '钩载 HKLA', type: 'metric', metricKey: 'hookLoad', color: '#ea580c' },
  { key: 'torque', ref: 'chartTorque', title: '扭矩 TORQA', type: 'metric', metricKey: 'torque', color: '#be123c' },
  { key: 'rop', ref: 'chartRop', title: '钻时 ROPA', type: 'metric', metricKey: 'rop', color: '#475569' },
  { key: 'pitFlow', ref: 'chartPitFlow', title: '总池体积变化 + 流量差', type: 'composite', seriesDefs: [{ metricKey: 'pitGain', name: '池增量 ΔTVOLACT', color: '#0f766e', axisName: 'm³', position: 'left' }, { metricKey: 'flowBalance', name: '流量差 ΔFlow', color: '#2563eb', axisName: 'L/s', position: 'right' }, { metricKey: 'flowBalanceIntegral', name: '流量差积分 ΔFlow_int', color: '#dc2626', axisName: 'L', position: 'right', offset: 88 }] },
  { key: 'pumpFlowIn', ref: 'chartPumpFlowIn', title: '泵冲 + 入口流量', type: 'composite', seriesDefs: [{ metricKey: 'pumpSpmTotal', name: '总泵冲 SPM', color: '#0284c7', axisName: 'spm', position: 'left' }, { metricKey: 'flowIn', name: '入口流量 MFIA', color: '#16a34a', axisName: 'L/s', position: 'right' }] },
  { key: 'gasChoke', ref: 'chartGasChoke', title: '全烃 + 套压', type: 'composite', seriesDefs: [{ metricKey: 'gas', name: '全烃 GASA', color: '#ca8a04', axisName: '%', position: 'left' }, { metricKey: 'chokePressure', name: '套压 CHKP', color: '#7c2d12', axisName: 'MPa', position: 'right' }] }
];

function metricSeriesState() {
  return { raw: [], baseline: [], ptd: [], upper: [], lower: [], anomalies: [] };
}

function valid(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export default {
  name: 'PtdRiskDashboard',
  props: {
    frames: { type: Array, default: () => [] },
    events: { type: Array, default: () => [] },
    sampling: { type: Object, default: () => ({}) },
    configVersion: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    pageMode: { type: String, default: 'history' },
    currentWellId: { type: String, default: '' },
    emptyText: { type: String, default: '请先启动查询或实时监测。' },
    allowStatusUpdate: { type: Boolean, default: true },
    showHighlight: { type: Boolean, default: true },
    groupEvents: { type: Boolean, default: false },
    showEventActions: { type: Boolean, default: true },
    defaultWindowMinutes: { type: Number, default: 20 },
    autoFollowLatest: { type: Boolean, default: false },
    eventLocatePaddingMinutes: { type: Number, default: 2 },
    hideHighlightWhenNormal: { type: Boolean, default: false }
  },
  data() {
    return { chartLayouts: CHART_LAYOUTS, chartInstances: {}, detailVisible: false, selectedEventId: '', resizeObserver: null, zoomRange: null, manualZoomLocked: false, syncingZoom: false, expandedGroupNames: [], renderTimer: null, statusLoadingMap: {} };
  },
  computed: {
    hasData() { return this.frames && this.frames.length > 0; },
    pageModeLabel() { return this.pageMode === 'realtime' ? '实时统一风险判定' : '历史统一风险回放'; },
    latestFrame() { return this.hasData ? this.frames[this.frames.length - 1] : null; },
    earliestFrame() { return this.hasData ? this.frames[0] : null; },
    timeSpanMs() { return this.hasData ? Math.max(0, this.latestFrame.timestampMs - this.earliestFrame.timestampMs) : 0; },
    latestSeverityMeta() { return this.latestFrame ? getSeverityMeta(this.latestFrame.severity, this.latestFrame.severityLevel) : getSeverityMeta('L0'); },
    sortedEvents() {
      return (this.events || []).slice().sort((a, b) => (b.startTimeMs || 0) - (a.startTimeMs || 0) || (b.severityLevel || 0) - (a.severityLevel || 0));
    },
    groupedEventGroups() {
      const groups = {};
      (this.events || []).forEach((item) => {
        const key = item.riskType || '未分类';
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
      return Object.keys(groups)
        .map((key) => {
          const events = groups[key].slice().sort((a, b) => (a.startTimeMs || 0) - (b.startTimeMs || 0) || (b.severityLevel || 0) - (a.severityLevel || 0));
          const maxSeverityLevel = events.reduce((max, item) => Math.max(max, item.severityLevel || 0), 0);
          const latestStartTime = events.reduce((max, item) => Math.max(max, item.startTimeMs || 0), 0);
          return {
            name: key,
            events,
            maxSeverityLevel,
            maxSeverityCode: `L${maxSeverityLevel}`,
            latestStartTime
          };
        })
        .sort((a, b) => b.maxSeverityLevel - a.maxSeverityLevel || b.latestStartTime - a.latestStartTime || a.name.localeCompare(b.name, 'zh-Hans-CN'));
    },
    activeEvents() { return this.sortedEvents.filter(item => item.isActive); },
    highlightEvent() {
      if (this.selectedEventId) {
        const selected = this.sortedEvents.find(item => item.eventId === this.selectedEventId);
        if (selected) return selected;
      }
      if (this.activeEvents.length) return this.activeEvents[0];
      return this.sortedEvents.find(item => item.severityLevel > 0) || null;
    },
    highlightSeverityMeta() { return this.highlightEvent ? getSeverityMeta(this.highlightEvent.severity, this.highlightEvent.severityLevel) : this.latestSeverityMeta; },
    showHighlightCard() {
      if (!this.showHighlight || !this.highlightEvent) return false;
      if (this.hideHighlightWhenNormal && this.highlightEvent.severityLevel <= 0) return false;
      return true;
    },
    samplingView() { return this.sampling || {}; },
    severityCounts() {
      return (this.events || []).reduce((acc, item) => {
        const key = item.severity || 'L0';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, { L0: 0, L1: 0, L2: 0, L3: 0 });
    },
    selectedEvent() {
      if (!this.selectedEventId) return this.highlightEvent;
      return this.sortedEvents.find(item => item.eventId === this.selectedEventId) || this.highlightEvent;
    },
    datasetKey() {
      const latestEvent = this.sortedEvents[0];
      return [this.frames.length, this.latestFrame ? this.latestFrame.timestampMs : 0, this.events.length, latestEvent ? latestEvent.eventId : '', latestEvent ? latestEvent.endTimeMs : 0].join('|');
    },
    dashboardDataset() {
      const metrics = { standpipePress: metricSeriesState(), outletFlow: metricSeriesState(), poolVolume: metricSeriesState(), hookLoad: metricSeriesState(), torque: metricSeriesState(), rop: metricSeriesState(), pitGain: metricSeriesState(), flowBalance: metricSeriesState(), flowBalanceIntegral: metricSeriesState(), pumpSpmTotal: metricSeriesState(), flowIn: metricSeriesState(), gas: metricSeriesState(), chokePressure: metricSeriesState() };
      const severity = [];
      const newEvents = [];
      const frameMap = {};
      (this.frames || []).forEach((frame) => {
        if (frame.timestampMs === null) return;
        const timePoint = frame.timestampMs;
        frameMap[timePoint] = frame;
        severity.push([timePoint, frame.severityLevel]);
        if (frame.isNewEvent && frame.severityLevel > 0) newEvents.push([timePoint, frame.severityLevel]);
        Object.keys(metrics).forEach((metricKey) => {
          const metric = frame.metrics[metricKey];
          metrics[metricKey].raw.push([timePoint, metric.originalValue]);
          metrics[metricKey].baseline.push([timePoint, metric.baseline]);
          metrics[metricKey].ptd.push([timePoint, metric.ptdValue]);
          metrics[metricKey].upper.push([timePoint, metric.upperThreshold]);
          metrics[metricKey].lower.push([timePoint, metric.lowerThreshold]);
          metrics[metricKey].anomalies.push(metric.isAnomaly ? [timePoint, metric.originalValue] : [timePoint, null]);
        });
      });
      const markAreas = (this.events || []).map(item => [{ xAxis: item.startTimeMs, itemStyle: { color: getSeverityMeta(item.severity, item.severityLevel).areaColor } }, { xAxis: item.endTimeMs > item.startTimeMs ? item.endTimeMs : item.startTimeMs + 1000 }]);
      return { metrics, severity, newEvents, frameMap, markAreas };
    }
  },
  watch: {
    datasetKey() {
      this.ensureSelectedEvent();
      this.ensureZoomRange();
      this.ensureExpandedGroups();
      this.scheduleRender();
    }
  },
  mounted() {
    this.ensureSelectedEvent();
    this.ensureZoomRange(true);
    this.ensureExpandedGroups();
    if (window.ResizeObserver && this.$el) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.$el);
    }
    window.addEventListener('resize', this.handleResize);
    this.scheduleRender();
  },
  beforeDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.handleResize);
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.disposeCharts();
  },
  methods: {
    formatNumber,
    formatDuration,
    getSeverityMetaFor(severity, level) { return getSeverityMeta(severity, level); },
    getStatusMetaFor(status) { return getStatusMeta(status); },
    ensureSelectedEvent() {
      const exists = this.selectedEventId && this.sortedEvents.some(item => item.eventId === this.selectedEventId);
      if (!exists && this.highlightEvent) this.selectedEventId = this.highlightEvent.eventId;
    },
    ensureExpandedGroups() {
      if (!this.groupEvents) return;
      const names = this.groupedEventGroups.map(item => item.name);
      this.expandedGroupNames = this.expandedGroupNames.filter(item => names.includes(item));
      if (!this.expandedGroupNames.length) {
        this.expandedGroupNames = this.groupedEventGroups
          .filter(item => item.maxSeverityLevel >= 2)
          .map(item => item.name);
      }
    },
    buildDefaultZoomRange() {
      if (!this.hasData) return null;
      const endValue = this.latestFrame.timestampMs;
      const startValue = Math.max(this.earliestFrame.timestampMs, endValue - Math.max(1, this.defaultWindowMinutes) * 60 * 1000);
      return { startValue, endValue };
    },
    normalizeZoomRange(range) {
      if (!range || !this.hasData) return null;
      const first = this.earliestFrame.timestampMs;
      const last = this.latestFrame.timestampMs;
      const startValue = Math.max(first, Math.min(last, Number(range.startValue)));
      const endValue = Math.max(startValue, Math.min(last, Number(range.endValue)));
      return { startValue, endValue };
    },
    ensureZoomRange(force = false) {
      if (!this.hasData) {
        this.zoomRange = null;
        return;
      }
      if (force || this.autoFollowLatest || !this.zoomRange || !this.manualZoomLocked) {
        this.zoomRange = this.buildDefaultZoomRange();
      } else {
        this.zoomRange = this.normalizeZoomRange(this.zoomRange);
      }
    },
    directionText(direction) { return direction === 'HIGH' ? '上升' : direction === 'LOW' ? '下降' : '平稳'; },
    directionTagType(direction) { return direction === 'HIGH' ? 'danger' : direction === 'LOW' ? 'warning' : 'info'; },
    getEventRowClassName({ row }) { return this.selectedEvent && row.eventId === this.selectedEvent.eventId ? 'event-row-active' : ''; },
    isStatusBusy(eventId) { return Boolean(eventId && this.statusLoadingMap[eventId]); },
    openEventDetail(eventItem) {
      if (!eventItem) return;
      this.selectedEventId = eventItem.eventId;
      this.detailVisible = true;
    },
    jumpToEvent(eventItem) {
      if (!eventItem || !this.hasData) return;
      this.selectedEventId = eventItem.eventId;
      this.manualZoomLocked = true;
      const paddingMs = Math.max(0, this.eventLocatePaddingMinutes) * 60 * 1000;
      this.zoomRange = this.normalizeZoomRange({ startValue: (eventItem.startTimeMs || this.earliestFrame.timestampMs) - paddingMs, endValue: (eventItem.endTimeMs || this.latestFrame.timestampMs) + paddingMs });
      this.applyZoomRange();
    },
    async updateStatus(eventItem, status) {
      if (!eventItem || !eventItem.eventId || eventItem.status === status || this.isStatusBusy(eventItem.eventId)) return;
      const previousStatus = eventItem.status;
      this.$set(this.statusLoadingMap, eventItem.eventId, true);
      this.$emit('status-updated', { eventId: eventItem.eventId, status });
      try {
        const response = await updatePtdEventStatusApi({ eventId: eventItem.eventId, status });
        const nextStatus = response && response.data && response.data.status ? response.data.status : status;
        if (nextStatus !== status) {
          this.$emit('status-updated', { eventId: eventItem.eventId, status: nextStatus });
        }
        this.$message.success(`事件状态已更新为 ${getStatusMeta(nextStatus).label}`);
      } catch (error) {
        this.$emit('status-updated', { eventId: eventItem.eventId, status: previousStatus });
        this.$message.error('事件状态更新失败');
      } finally {
        this.$delete(this.statusLoadingMap, eventItem.eventId);
      }
    },
    scheduleRender() {
      if (this.renderTimer) clearTimeout(this.renderTimer);
      this.renderTimer = setTimeout(() => {
        this.$nextTick(() => {
          if (!this.hasData) {
            this.disposeCharts();
            return;
          }
          this.renderAllCharts();
        });
      }, this.pageMode === 'realtime' ? 180 : 0);
    },
    handleResize() {
      Object.keys(this.chartInstances).forEach((key) => {
        if (this.chartInstances[key]) this.chartInstances[key].resize();
      });
    },
    disposeCharts() {
      Object.keys(this.chartInstances).forEach((key) => {
        if (this.chartInstances[key]) this.chartInstances[key].dispose();
      });
      this.chartInstances = {};
    },
    formatAxisTime(value, compact = false) {
      const date = new Date(value);
      const pad = input => String(input).padStart(2, '0');
      const md = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      const hms = `${hm}:${pad(date.getSeconds())}`;
      if (compact) return this.timeSpanMs <= 2 * 60 * 60 * 1000 ? hms : `${md} ${hm}`;
      return this.timeSpanMs <= 2 * 60 * 60 * 1000 ? hms : `${md}\n${hm}`;
    },
    formatAxisValue(value) {
      if (!valid(value)) return '';
      const numeric = Number(value);
      const abs = Math.abs(numeric);
      if (abs >= 1000) return numeric.toFixed(0);
      if (abs >= 100) return numeric.toFixed(1);
      if (abs >= 1) return numeric.toFixed(2);
      return numeric.toFixed(3);
    },
    axisExtent(seriesList) {
      const values = [];
      (seriesList || []).forEach((series) => {
        (series || []).forEach((item) => {
          const value = Array.isArray(item) ? item[1] : null;
          if (valid(value)) values.push(Number(value));
        });
      });
      if (!values.length) return {};
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (min === max) {
        const pad = Math.max(Math.abs(min) * 0.08, 1);
        return { min: min - pad, max: max + pad };
      }
      const pad = Math.max((max - min) * 0.08, 0.001);
      return { min: min - pad, max: max + pad };
    },
    buildValueAxis(name, color, seriesList, position = 'left', offset = 0, showSplitLine = true) {
      const extent = this.axisExtent(seriesList);
      const isRight = position === 'right';
      return {
        type: 'value',
        name,
        position,
        offset,
        splitNumber: 5,
        nameLocation: 'end',
        nameRotate: 0,
        nameGap: 16,
        nameTextStyle: { color, fontSize: 11, fontWeight: 500, align: isRight ? 'right' : 'left' },
        axisLabel: { color: '#475569', fontSize: 11, margin: 12, formatter: value => this.formatAxisValue(value) },
        axisLine: { show: true, lineStyle: { color } },
        splitLine: { show: showSplitLine, lineStyle: { color: '#e2e8f0', type: 'dashed' } },
        min: extent.min,
        max: extent.max
      };
    },
    buildBaseOption(extra = {}) {
      const zoom = this.zoomRange || this.buildDefaultZoomRange();
      return Object.assign({
        animation: false,
        title: {
          text: '',
          left: 18,
          top: 24,
          padding: 0,
          textStyle: { fontSize: 11, lineHeight: 11, color: '#475569', fontWeight: 500, verticalAlign: 'middle' }
        },
        legend: {
          top: 24,
          right: 20,
          padding: 0,
          itemWidth: 18,
          itemHeight: 10,
          textStyle: { color: '#475569', fontSize: 11, lineHeight: 11 }
        },
        grid: { left: 72, right: 84, top: 96, bottom: 48 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        dataZoom: [
          { type: 'inside', filterMode: 'none', startValue: zoom ? zoom.startValue : undefined, endValue: zoom ? zoom.endValue : undefined },
          {
            type: 'slider',
            filterMode: 'none',
            bottom: 5,
            height: 15,
            startValue: zoom ? zoom.startValue : undefined,
            endValue: zoom ? zoom.endValue : undefined,
            labelFormatter: value => this.formatAxisTime(value, true)
          }
        ],
        xAxis: {
          type: 'time',
          boundaryGap: false,
          axisLabel: { color: '#475569', fontSize: 11, margin: 10, hideOverlap: true, formatter: value => this.formatAxisTime(value) },
          axisLine: { lineStyle: { color: '#cbd5e1' } }
        }
      }, extra);
    },
    tooltipFormatter(params) {
      if (!params || !params.length) return '';
      const axisValue = params[0].axisValue;
      const frame = this.dashboardDataset.frameMap[axisValue];
      const lines = [formatDateTime(axisValue)];
      if (frame) {
        lines.push(`工况: ${frame.activityBucket || frame.activityCode || '-'}`);
        lines.push(`风险: ${frame.severity} ${frame.riskType}`);
      }
      params.forEach((item) => {
        const value = Array.isArray(item.data) ? item.data[1] : null;
        if (!valid(value)) return;
        lines.push(`${item.marker}${item.seriesName}: ${this.formatAxisValue(value)}`);
      });
      return lines.join('<br/>');
    },
    buildOverviewOption() {
      return this.buildBaseOption({
        title: { text: '风险等级曲线' },
        tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params) },
        yAxis: {
          type: 'value',
          min: 0,
          max: 3,
          interval: 1,
          name: '风险等级',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 16,
          nameTextStyle: { color: '#334155', fontSize: 11, fontWeight: 500, align: 'left' },
          axisLabel: { color: '#475569', fontSize: 11, margin: 12, formatter: value => getSeverityMeta(`L${value}`).label },
          splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
        },
        series: [
          { name: '风险等级', type: 'line', step: 'end', showSymbol: false, lineStyle: { width: 2, color: '#d97706' }, itemStyle: { color: '#d97706' }, markArea: { silent: true, data: this.dashboardDataset.markAreas }, data: this.dashboardDataset.severity },
          { name: '新事件', type: 'scatter', symbolSize: 10, itemStyle: { color: '#dc2626' }, data: this.dashboardDataset.newEvents }
        ]
      });
    },
    metricUnit(metricKey) {
      const metric = this.latestFrame && this.latestFrame.metrics ? this.latestFrame.metrics[metricKey] : null;
      return metric && metric.unit ? metric.unit : '';
    },
    buildMetricOption(layout) {
      const series = this.dashboardDataset.metrics[layout.metricKey];
      const unit = this.metricUnit(layout.metricKey);
      return this.buildBaseOption({ title: { text: layout.title }, tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params) }, yAxis: [this.buildValueAxis(unit ? `原值 (${unit})` : '原值', layout.color, [series.raw, series.baseline, series.anomalies], 'left', 0, true), this.buildValueAxis('PTD / MAD', '#9333ea', [series.ptd, series.upper, series.lower], 'right', 0, false)], series: [{ name: '原值', type: 'line', yAxisIndex: 0, showSymbol: false, sampling: 'lttb', lineStyle: { width: 2, color: layout.color }, itemStyle: { color: layout.color }, markArea: { silent: true, data: this.dashboardDataset.markAreas }, data: series.raw }, { name: '基线', type: 'line', yAxisIndex: 0, showSymbol: false, sampling: 'lttb', lineStyle: { width: 1, type: 'dashed', color: '#64748b' }, itemStyle: { color: '#64748b' }, data: series.baseline }, { name: 'PTD', type: 'line', yAxisIndex: 1, showSymbol: false, sampling: 'lttb', lineStyle: { width: 1.5, color: '#9333ea' }, itemStyle: { color: '#9333ea' }, data: series.ptd }, { name: '上阈', type: 'line', yAxisIndex: 1, showSymbol: false, lineStyle: { width: 1, type: 'dashed', color: '#dc2626' }, itemStyle: { color: '#dc2626' }, data: series.upper }, { name: '下阈', type: 'line', yAxisIndex: 1, showSymbol: false, lineStyle: { width: 1, type: 'dashed', color: '#2563eb' }, itemStyle: { color: '#2563eb' }, data: series.lower }, { name: '异常点', type: 'scatter', yAxisIndex: 0, symbolSize: 7, itemStyle: { color: '#dc2626' }, data: series.anomalies }] });
    },
    buildCompositeOption(layout) {
      const yAxis = layout.seriesDefs.map(item => this.buildValueAxis(item.axisName || item.name, item.color, [this.dashboardDataset.metrics[item.metricKey].raw], item.position || 'left', item.offset || 0, item.position !== 'right' || !item.offset));
      const series = layout.seriesDefs.map((item, index) => ({ name: item.name, type: 'line', yAxisIndex: index, showSymbol: false, sampling: 'lttb', lineStyle: { width: 2, color: item.color }, itemStyle: { color: item.color }, markArea: index === 0 ? { silent: true, data: this.dashboardDataset.markAreas } : undefined, data: this.dashboardDataset.metrics[item.metricKey].raw }));
      return this.buildBaseOption({ title: { text: layout.title }, grid: { left: 72, right: layout.seriesDefs.length >= 3 ? 214 : 88, top: 96, bottom: 48 }, tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params) }, yAxis, series });
    },
    buildChartOption(layout) {
      if (layout.type === 'overview') return this.buildOverviewOption();
      if (layout.type === 'metric') return this.buildMetricOption(layout);
      return this.buildCompositeOption(layout);
    },
    captureZoom(chart) {
      if (this.syncingZoom || !chart || !this.hasData) return;
      const option = chart.getOption();
      const zoom = (option.dataZoom || []).find(item => Object.prototype.hasOwnProperty.call(item, 'startValue'));
      if (!zoom || zoom.startValue === undefined || zoom.endValue === undefined) return;
      this.manualZoomLocked = true;
      this.zoomRange = this.normalizeZoomRange({ startValue: zoom.startValue, endValue: zoom.endValue });
    },
    getOrCreateChart(layout) {
      if (this.chartInstances[layout.key]) return this.chartInstances[layout.key];
      const target = this.$refs[layout.ref];
      const dom = Array.isArray(target) ? target[0] : target;
      if (!dom) return null;
      const chart = echarts.init(dom);
      chart.group = `ptd-risk-${this._uid}`;
      chart.on('dataZoom', () => this.captureZoom(chart));
      this.chartInstances[layout.key] = chart;
      return chart;
    },
    applyZoomRange() {
      if (!this.zoomRange) return;
      this.syncingZoom = true;
      Object.keys(this.chartInstances).forEach((key) => {
        const chart = this.chartInstances[key];
        if (chart) chart.dispatchAction({ type: 'dataZoom', startValue: this.zoomRange.startValue, endValue: this.zoomRange.endValue });
      });
      this.$nextTick(() => { this.syncingZoom = false; });
    },
    renderAllCharts() {
      this.chartLayouts.forEach((layout) => {
        const chart = this.getOrCreateChart(layout);
        if (chart) chart.setOption(this.buildChartOption(layout), true);
      });
      echarts.connect(`ptd-risk-${this._uid}`);
      this.applyZoomRange();
      this.handleResize();
    }
  }
};
</script>

<style scoped>
.ptd-dashboard { display: flex; flex-direction: column; gap: 16px; }
.empty-box { padding: 48px 16px; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center; color: #475569; background: #f8fafc; }
.summary-card, .focus-card, .chart-card { border-radius: 12px; margin-top: 16px; }
.summary-card { min-height: 120px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; }
.summary-label { color: #64748b; font-size: 12px; }
.summary-value { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; font-size: 18px; font-weight: 600; color: #0f172a; }
.summary-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; color: #475569; font-size: 12px; }
.focus-head, .action-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
.chart-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; color: #475569; }
.chart-head span:first-child { color: #0f172a; font-weight: 600; }
.chart-panel { overflow: hidden; }
.chart-canvas { width: 100%; height: 420px; }
.group-title-row, .group-meta { display: flex; align-items: center; gap: 10px; }
.group-title { font-weight: 600; }
.dialog-meta, .dialog-actions { margin-bottom: 12px; }
.event-row-active td { background: #fff7ed !important; }
</style>

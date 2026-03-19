<template>
  <div class="anomaly-container">
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再进行综合异常实时监测。
    </el-alert>

    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" size="small">
        <el-form-item label="当前井号">
          <el-tag type="info" effect="dark">{{ currentWellId || '未选择' }}</el-tag>
        </el-form-item>
        <el-form-item label="起始时间">
          <el-date-picker
            v-model="searchForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 220px;" />
        </el-form-item>
        <el-form-item label="回放速率">
          <el-radio-group v-model="searchForm.playbackSpeed" size="small" @change="handlePlaybackSpeedChange">
            <el-radio-button v-for="speed in playbackSpeedOptions" :key="speed" :label="speed">
              {{ speed }}x
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="success" icon="el-icon-video-play" :loading="loading || isStopping" @click="startSimulation">
            启动流式预警
          </el-button>
          <el-button type="danger" icon="el-icon-video-pause" :disabled="!isSimulating || isStopping" @click="stopSimulation">
            停止监测
          </el-button>
        </el-form-item>
      </el-form>

      <div class="status-row">
        <el-tag :type="isSimulating ? (waitingForNewData ? 'warning' : 'success') : 'info'" size="small" effect="plain">
          {{ isSimulating ? (waitingForNewData ? '等待新数据' : '运行中') : '未运行' }}
        </el-tag>
        <span>实时数据保留 {{ realtimeRetentionMinutes }} 分钟，时间轴默认展示最后 {{ defaultWindowMinutes }} 分钟，L1 未处理 {{ l1TimeoutMinutes }} 分钟后标记超时。</span>
        <span v-if="loading && !displayFrames.length">{{ dashboardLoadingText }}</span>
        <span v-if="waitingForNewData">当前已追到表尾，正在持续等待后续实时数据。</span>
        <span v-if="configVersion">配置版本 {{ configVersion }}</span>
      </div>
    </el-card>

    <PtdRiskDashboard
      :frames="displayFrames"
      :events="displayEvents"
      :sampling="sampling"
      :config-version="configVersion"
      :loading="loading"
      page-mode="realtime"
      :current-well-id="currentWellId"
      :default-window-minutes="defaultWindowMinutes"
      :auto-follow-latest="true"
      :hide-highlight-when-normal="true"
      :loading-text="dashboardLoadingText"
      :empty-text="dashboardEmptyText"
      @status-updated="handleStatusUpdated" />
  </div>
</template>

<script>
import * as signalR from '@microsoft/signalr';
import { Notification } from 'element-ui';
import PtdRiskDashboard from './PtdRiskDashboard.vue';
import { getMonitorHubUrl, getPtdAnalysisConfigApi } from '@/api/index';
import {
  buildDefaultStartTime,
  computeSamplingFromFrames,
  formatDateTime,
  normalizeConfigDetail,
  normalizeFrame,
  normalizeRealtimeDelivery
} from '@/utils/ptdRisk';

const DEFAULT_WINDOW_MINUTES = 20;
const REALTIME_RETENTION_MINUTES = 60;
const L1_TIMEOUT_MINUTES = 10;
const REALTIME_RECONNECT_MAX_MINUTES = 30;

const realtimeReconnectPolicy = {
  nextRetryDelayInMilliseconds(context) {
    if (!context || context.elapsedMilliseconds >= REALTIME_RECONNECT_MAX_MINUTES * 60 * 1000) {
      return null;
    }

    if (context.previousRetryCount === 0) {
      return 0;
    }

    if (context.previousRetryCount === 1) {
      return 2000;
    }

    if (context.previousRetryCount === 2) {
      return 10000;
    }

    return 30000;
  }
};

function cloneEventFromFrame(frame) {
  return {
    eventId: frame.eventId,
    startTime: frame.timestamp,
    startTimeMs: frame.timestampMs,
    startTimeLabel: frame.timestampLabel,
    endTime: frame.timestamp,
    endTimeMs: frame.timestampMs,
    endTimeLabel: frame.timestampLabel,
    durationSec: 0,
    riskType: frame.riskType,
    severity: frame.severity,
    severityLevel: frame.severityLevel,
    status: frame.status,
    isActive: Boolean(frame.eventId),
    evidence: (frame.evidence || []).slice(),
    advice: (frame.advice || []).slice()
  };
}

export default {
  name: 'ComprehensiveAnomaly',
  components: {
    PtdRiskDashboard
  },
  data() {
    return {
      loading: false,
      isSimulating: false,
      isStopping: false,
      waitingForNewData: false,
      hubConnection: null,
      activeEventId: '',
      frames: [],
      events: [],
      sampling: {},
      analysisRunId: '',
      configVersion: '',
      selectedConfigVersionId: '',
      notifiedEventLevels: {},
      statusOverrides: {},
      loadingMessage: '正在准备首批实时数据，先加载原始曲线与统一风险结果...',
      defaultWindowMinutes: DEFAULT_WINDOW_MINUTES,
      realtimeRetentionMinutes: REALTIME_RETENTION_MINUTES,
      l1TimeoutMinutes: L1_TIMEOUT_MINUTES,
      playbackSpeedOptions: [1, 2, 5, 10],
      searchForm: {
        startTime: buildDefaultStartTime(this.$store.state.StartTime),
        playbackSpeed: 1
      }
    };
  },
  computed: {
    currentWellId() {
      return this.$store.state.jh || '';
    },
    displayFrames() {
      return this.frames;
    },
    dashboardLoadingText() {
      return this.loadingMessage || '正在准备首批实时数据，先加载原始曲线与统一风险结果...';
    },
    dashboardEmptyText() {
      if (this.waitingForNewData && !this.displayFrames.length) {
        return '当前起始时间之后暂无可展示数据，监测链路已进入等待模式，你可以把起始时间往前调整一些。';
      }
      return '启动流式预警后，这里将只展示后端统一判定结果。';
    },
    displayEvents() {
      const referenceMs = this.frames.length ? this.frames[this.frames.length - 1].timestampMs : 0;
      return this.events
        .filter(item => referenceMs > 0 && (item.startTimeMs || 0) <= referenceMs)
        .map((item) => {
        const endTimeMs = item.endTimeMs && item.endTimeMs > referenceMs ? referenceMs : item.endTimeMs;
        const endTime = endTimeMs ? new Date(endTimeMs) : item.endTime;
        let status = item.status;
        if (item.severity === 'L1' && status === 'NEW' && referenceMs - item.startTimeMs >= this.l1TimeoutMinutes * 60 * 1000) {
          status = 'TIMEOUT';
        }
        return {
          ...item,
          endTime,
          endTimeMs,
          endTimeLabel: formatDateTime(endTime),
          durationSec: Math.max(0, ((endTimeMs || item.startTimeMs || 0) - (item.startTimeMs || 0)) / 1000),
          isActive: Boolean(item.isActive) || ((item.endTimeMs || 0) > referenceMs),
          status
        };
      })
        .sort((a, b) => (b.startTimeMs || 0) - (a.startTimeMs || 0));
    }
  },
  watch: {
    currentWellId() {
      this.searchForm.startTime = buildDefaultStartTime(this.$store.state.StartTime);
      this.loadConfig();
    }
  },
  mounted() {
    this.loadConfig();
  },
  beforeDestroy() {
    this.stopSimulation({ silent: true });
  },
  methods: {
    async loadConfig() {
      if (!this.currentWellId) {
        this.configVersion = '';
        this.selectedConfigVersionId = '';
        return;
      }

      try {
        const response = await getPtdAnalysisConfigApi({ wellId: this.currentWellId });
        const normalized = normalizeConfigDetail(response && response.data ? response.data : response);
        this.configVersion = normalized.versionCode || ((normalized.config || {}).version || '');
        this.selectedConfigVersionId = normalized.configVersionId || '';
      } catch (error) {
        this.configVersion = '';
        this.selectedConfigVersionId = '';
      }
    },
    resetState() {
      this.frames = [];
      this.events = [];
      this.sampling = {};
      this.analysisRunId = '';
      this.activeEventId = '';
      this.waitingForNewData = false;
      this.notifiedEventLevels = {};
      this.statusOverrides = {};
      this.loadingMessage = '正在准备首批实时数据，先加载原始曲线与统一风险结果...';
    },
    buildStatusOverrideKey(item) {
      const runId = item && item.analysisRunId ? item.analysisRunId : this.analysisRunId;
      const identity = item && (item.recordId || item.eventId) ? (item.recordId || item.eventId) : '';
      return runId && identity ? `${runId}|${identity}` : '';
    },
    applyStatusOverride(item) {
      const key = this.buildStatusOverrideKey(item);
      if (!key || !Object.prototype.hasOwnProperty.call(this.statusOverrides, key)) {
        return item;
      }

      return {
        ...item,
        status: this.statusOverrides[key]
      };
    },
    updateSampling() {
      this.sampling = computeSamplingFromFrames(this.frames);
    },
    pruneRealtimeData(referenceMs) {
      const retentionCutoff = referenceMs - this.realtimeRetentionMinutes * 60 * 1000;
      this.frames = this.frames.filter(frame => frame.timestampMs >= retentionCutoff);
      this.events = this.events.filter(item => (item.endTimeMs || item.startTimeMs || 0) >= retentionCutoff);
    },
    mergeBackendEvents(incomingEvents) {
      if (!incomingEvents || !incomingEvents.length) {
        return;
      }

      const eventMap = {};
      this.events.forEach((item) => {
        eventMap[item.recordId || item.eventId] = item;
      });

      incomingEvents.forEach((item) => {
        const merged = {
          ...(eventMap[item.recordId || item.eventId] || {}),
          ...item
        };
        eventMap[item.recordId || item.eventId] = this.applyStatusOverride(merged);
      });

      this.events = Object.values(eventMap).sort((a, b) => (b.startTimeMs || 0) - (a.startTimeMs || 0));
    },
    findEventIndex(eventId) {
      return this.events.findIndex(item => item.eventId === eventId);
    },
    upsertEventFromFrame(frame) {
      const nextEvents = this.events.slice();

      if (frame.eventId) {
        const existingIndex = this.findEventIndex(frame.eventId);
        if (existingIndex === -1) {
          nextEvents.unshift(cloneEventFromFrame(frame));
        } else {
          const current = nextEvents[existingIndex];
          nextEvents.splice(existingIndex, 1, {
            ...current,
            endTime: frame.timestamp,
            endTimeMs: frame.timestampMs,
            endTimeLabel: frame.timestampLabel,
            durationSec: Math.max(0, (frame.timestampMs - current.startTimeMs) / 1000),
            riskType: frame.riskType,
            severity: frame.severity,
            severityLevel: frame.severityLevel,
            status: frame.status,
            isActive: Boolean(frame.eventId),
            evidence: (frame.evidence || []).slice(),
            advice: (frame.advice || []).slice()
          });
        }

        if (this.activeEventId && this.activeEventId !== frame.eventId) {
          const activeIndex = nextEvents.findIndex(item => item.eventId === this.activeEventId);
          if (activeIndex >= 0) {
            nextEvents.splice(activeIndex, 1, {
              ...nextEvents[activeIndex],
              isActive: false
            });
          }
        }

        this.activeEventId = frame.eventId;
      } else if (this.activeEventId) {
        const activeIndex = nextEvents.findIndex(item => item.eventId === this.activeEventId);
        if (activeIndex >= 0) {
          nextEvents.splice(activeIndex, 1, {
            ...nextEvents[activeIndex],
            isActive: false
          });
        }
        this.activeEventId = '';
      }

      this.events = nextEvents
        .map(item => this.applyStatusOverride(item))
        .sort((a, b) => b.startTimeMs - a.startTimeMs);
    },
    notifyFrame(frame) {
      if (!frame.eventId || frame.severityLevel <= 0) {
        return;
      }

      const previousLevel = this.notifiedEventLevels[frame.eventId] || 0;
      if (frame.severityLevel <= previousLevel) {
        return;
      }

      this.$set(this.notifiedEventLevels, frame.eventId, frame.severityLevel);

      if (frame.severityLevel === 1) {
        this.$message.warning(`${frame.severity} ${frame.riskType}`);
        return;
      }

      if (frame.severityLevel === 2) {
        Notification.warning({
          title: 'L2 疑似溢流',
          duration: 0,
          message: `${frame.riskType}，请立即核对 PVT、流量差与井口状态。`
        });
        return;
      }

      Notification.error({
        title: 'L3 确认溢流',
        duration: 0,
        message: `${frame.riskType}，请立即执行井控 SOP 并回填处理状态。`
      });
    },
    normalizeWellId(value) {
      return String(value || '').trim().replace(/-/g, '');
    },
    async handleConfigActivationRequested(payload) {
      const action = payload && payload.action ? String(payload.action).toUpperCase() : '';
      if (action !== 'RESTART') {
        return;
      }

      const targetWellId = this.normalizeWellId(payload && payload.wellId ? payload.wellId : '');
      if (!targetWellId || targetWellId !== this.normalizeWellId(this.currentWellId)) {
        return;
      }

      const lastFrame = this.frames.length ? this.frames[this.frames.length - 1] : null;
      const restartTime = lastFrame && lastFrame.timestamp
        ? formatDateTime(lastFrame.timestamp)
        : this.searchForm.startTime;

      this.selectedConfigVersionId = payload && payload.configVersionId
        ? payload.configVersionId
        : this.selectedConfigVersionId;
      this.configVersion = payload && payload.configVersionCode
        ? payload.configVersionCode
        : this.configVersion;

      this.$message.warning(
        (payload && payload.message) || '检测配置已切换，当前实时监测会按新版本自动重启'
      );

      await this.stopSimulation({ silent: true });

      if (!restartTime) {
        return;
      }

      this.searchForm.startTime = restartTime;
      await this.startSimulation();
    },
    handleRealtimeFrame(payload) {
      const delivery = normalizeRealtimeDelivery(payload);
      const frame = delivery && delivery.frame && delivery.frame.timestampMs !== null
        ? delivery.frame
        : normalizeFrame(payload);
      if (!frame || frame.timestampMs === null) {
        return;
      }

      this.frames = this.frames.concat(frame);
      this.analysisRunId = delivery.analysisRunId || this.analysisRunId;
      this.configVersion = delivery.configVersion || this.configVersion;
      this.selectedConfigVersionId = delivery.configVersionId || this.selectedConfigVersionId;
      if (delivery && delivery.events && delivery.events.length) {
        this.mergeBackendEvents(delivery.events);
      } else {
        this.upsertEventFromFrame(frame);
      }
      this.pruneRealtimeData(frame.timestampMs);
      this.sampling = delivery && delivery.sampling && delivery.sampling.sampleCount
        ? delivery.sampling
        : computeSamplingFromFrames(this.frames);
      this.notifyFrame(frame);
      this.waitingForNewData = false;
      this.loading = false;
    },
    async createConnection() {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(getMonitorHubUrl())
        .withAutomaticReconnect(realtimeReconnectPolicy)
        .build();
      connection.serverTimeoutInMilliseconds = 10 * 60 * 1000;
      connection.keepAliveIntervalInMilliseconds = 15 * 1000;

      connection.on('ReceiveRealtimeData', (payload) => {
        if (this.hubConnection !== connection) {
          return;
        }
        this.handleRealtimeFrame(payload);
      });

      connection.on('SimulationWaiting', (payload) => {
        if (this.hubConnection !== connection) {
          return;
        }

        const wasWaiting = this.waitingForNewData;
        this.waitingForNewData = true;
        this.loadingMessage = payload && payload.message
          ? payload.message
          : '已追到当前表尾，正在等待新数据接入。';
        this.loading = false;
        const message = payload && payload.message
          ? payload.message
          : '已追到当前表尾，正在等待新数据接入。';
        if (!wasWaiting) {
          const suffix = this.frames.length
            ? ''
            : ' 当前起始时间之后暂无可展示数据，可以把起始时间往前调整一些。';
          this.$message.info(`${message}${suffix}`);
        }
      });

      connection.on('SimulationResumed', (payload) => {
        if (this.hubConnection !== connection) {
          return;
        }

        this.waitingForNewData = false;
        this.loadingMessage = '检测到新数据，实时监测继续推送。';
        const resumedAt = payload && payload.resumedAt ? payload.resumedAt : null;
        if (resumedAt) {
          this.$message.success(`检测到 ${formatDateTime(resumedAt)} 之后的新数据，实时监测继续运行`);
        } else {
          this.$message.success('检测到新数据，实时监测继续运行');
        }
      });

      connection.on('ConfigActivationRequested', async (payload) => {
        if (this.hubConnection !== connection) {
          return;
        }
        await this.handleConfigActivationRequested(payload);
      });

      connection.onreconnecting((error) => {
        if (this.hubConnection !== connection) {
          return;
        }

        this.waitingForNewData = false;
        this.loading = true;
        this.loadingMessage = '连接暂时中断，正在自动重连实时监测链路...';
        const reason = error && error.message ? error.message : '连接暂时中断';
        this.$message.warning(`${reason}，正在自动重连实时监测链路`);
      });

      connection.onreconnected(() => {
        if (this.hubConnection !== connection) {
          return;
        }

        this.loading = false;
        this.$message.success('实时监测连接已恢复');
      });

      connection.on('SimulationFinished', async (message) => {
        if (this.hubConnection !== connection) {
          return;
        }
        const endTimeLabel = this.frames.length ? this.frames[this.frames.length - 1].timestampLabel : this.searchForm.startTime;
        this.$message.info(message || `实时回放已到数据末尾（${endTimeLabel}），并非因发现异常自动中止`);
        await this.stopSimulation({ silent: true });
      });

      connection.on('SimulationError', async (message) => {
        if (this.hubConnection !== connection) {
          return;
        }
        this.$message.error(`流式预警异常: ${message}`);
        await this.stopSimulation({ silent: true });
      });

      connection.onclose(async () => {
        if (this.hubConnection !== connection || this.isStopping) {
          return;
        }
        this.$message.warning('监测连接已断开');
        await this.stopSimulation({ silent: true });
      });

      await connection.start();
      return connection;
    },
    buildSimulationConfig() {
      return JSON.stringify({
        playbackSpeed: Number(this.searchForm.playbackSpeed) || 1,
        configVersionId: this.selectedConfigVersionId || ''
      });
    },
    async startSimulation() {
      if (!this.currentWellId) {
        this.$message.warning('请先选择井号');
        return;
      }
      if (!this.searchForm.startTime) {
        this.$message.warning('请选择起始时间');
        return;
      }

      await this.stopSimulation({ silent: true });
      this.resetState();
      this.loading = true;
      this.loadingMessage = '正在准备首批实时数据，先加载原始曲线与统一风险结果...';

      try {
        await this.loadConfig();
        const connection = await this.createConnection();
        this.hubConnection = connection;
        await connection.send(
          'StartRealtimeSimulationAsync',
          this.currentWellId,
          this.searchForm.startTime,
          this.buildSimulationConfig()
        );
        this.isSimulating = true;
      } catch (error) {
        this.loading = false;
        this.isSimulating = false;
        this.$message.error('启动流式预警失败');
        if (this.hubConnection) {
          try {
            await this.hubConnection.stop();
          } catch (stopError) {
            // ignore
          }
          this.hubConnection = null;
        }
      }
    },
    async stopSimulation(options = {}) {
      const { silent = false } = options;
      const connection = this.hubConnection;
      this.hubConnection = null;
      this.isStopping = true;

      if (connection) {
        try {
          if (connection.state === signalR.HubConnectionState.Connected) {
            await connection.send('StopRealtimeSimulationAsync');
          }
        } catch (error) {
          // ignore stop send error
        }

        try {
          await connection.stop();
        } catch (error) {
          // ignore stop error
        }
      }

      this.isSimulating = false;
      this.loading = false;
      this.isStopping = false;
      this.waitingForNewData = false;

      if (!silent) {
        this.$message.success('监测已停止');
      }
    },
    async handlePlaybackSpeedChange(value) {
      this.searchForm.playbackSpeed = Number(value) || 1;

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      try {
        await this.hubConnection.send('UpdateSimulationSpeedAsync', this.searchForm.playbackSpeed);
        this.$message.success(`回放速率已切换为 ${this.searchForm.playbackSpeed}x`);
      } catch (error) {
        this.$message.error('回放速率切换失败');
      }
    },
    handleStatusUpdated({ eventId, recordId, status }) {
      const target = this.events.find(item => item.eventId === eventId || item.recordId === recordId);
      if (target) {
        const key = this.buildStatusOverrideKey(target);
        if (key) {
          this.$set(this.statusOverrides, key, status);
        }
      }
      this.events = this.events.map(item => {
        if (item.eventId !== eventId && item.recordId !== recordId) {
          return item;
        }
        return {
          ...item,
          status
        };
      });
    }
  }
};
</script>

<style scoped>
.anomaly-container {
  padding: 16px;
  background: #f8fafc;
  min-height: 100vh;
}

.well-alert {
  margin-bottom: 16px;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 16px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
  color: #475569;
  font-size: 13px;
}
</style>

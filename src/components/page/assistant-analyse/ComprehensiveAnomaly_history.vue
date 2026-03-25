<template>
  <div class="anomaly-container">
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再进行综合异常历史分析。
    </el-alert>

    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" size="small">
        <el-form-item label="当前井号">
          <el-tag type="info" effect="dark">{{ currentWellId || '未选择' }}</el-tag>
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
            style="width: 360px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" :disabled="!currentWellId" @click="fetchData">
            执行历史复盘
          </el-button>
        </el-form-item>
        <el-form-item label="跳转时间">
          <el-date-picker
            v-model="searchForm.jumpTime"
            type="datetime"
            placeholder="输入要定位的时间点"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-position" :disabled="loading || !frames.length" @click="jumpToTimePoint">
            跳到该区间
          </el-button>
        </el-form-item>
      </el-form>

      <div class="status-row">
        <span>单次最大回放区间 {{ maxHistoryRangeHours }} 小时</span>
        <span>历史页会按 PTD v4.1 在线因果链路，对你选定的时间窗重新拉取原始数据并重跑统一风险引擎。</span>
        <span>它用于复盘、参数验证和与实时结果对照，不会像实时页那样自动跟随新数据；有新数据时需要手动重新执行历史复盘。</span>
        <span v-if="configVersion">配置版本 {{ configVersion }}</span>
      </div>
    </el-card>

    <PtdRiskDashboard
      ref="riskDashboard"
      :frames="frames"
      :events="events"
      :sampling="sampling"
      :config-version="configVersion"
      :config-version-id="configVersionId"
      :loading="loading"
      page-mode="history"
      :current-well-id="currentWellId"
      :allow-status-update="false"
      :show-highlight="false"
      :group-events="true"
      :show-event-actions="false"
      :show-event-locate-action="true"
      :show-event-evidence-action="true"
      :show-event-status-column="false"
      :show-event-table-inline="false"
      :default-window-minutes="20"
      :show-formation-info="false"
      loading-text="正在重跑所选时间窗的 PTD v4.1 在线因果链路，用于历史复盘与参数验证，请稍候..."
      empty-text="请选择时间范围后执行历史复盘，页面会按 PTD v4.1 统一逻辑展示静态复盘结果。"
      @status-updated="handleStatusUpdated" />
  </div>
</template>

<script>
import PtdRiskDashboard from './PtdRiskDashboard.vue';
import { getUnifiedPtdHistoryApi } from '@/api/index';
import {
  buildDefaultTimeRange,
  normalizeHistoryResponse
} from '@/utils/ptdRisk';

const MAX_HISTORY_RANGE_HOURS = 6;
const HISTORY_REQUEST_TIMEOUT_MINUTES = 5;

export default {
  name: 'ComprehensiveAnomalyHistory',
  components: {
    PtdRiskDashboard
  },
  data() {
    return {
      loading: false,
      frames: [],
      events: [],
      sampling: {},
      configVersionId: '',
      configVersion: '',
      maxHistoryRangeHours: MAX_HISTORY_RANGE_HOURS,
      searchForm: {
        timeRange: buildDefaultTimeRange(this.$store.state.StartTime, 3),
        jumpTime: ''
      }
    };
  },
  computed: {
    currentWellId() {
      return this.$store.state.jh || '';
    }
  },
  methods: {
    resolveHistoryRequestErrorMessage(error) {
      const responseBody = error && error.response ? error.response.data : null;
      const serverMessage = responseBody ? (responseBody.msg || responseBody.message || '') : '';
      if (serverMessage) {
        return `历史复盘失败: ${serverMessage}`;
      }

      const errorCode = error && error.code ? String(error.code) : '';
      const rawMessage = error && error.message ? String(error.message) : '';
      if (errorCode === 'ECONNABORTED' || /timeout/i.test(rawMessage)) {
        return `历史复盘超时：服务端在 ${HISTORY_REQUEST_TIMEOUT_MINUTES} 分钟内未完成分析，请缩小时间范围后重试。`;
      }

      return rawMessage ? `历史复盘失败: ${rawMessage}` : '历史复盘失败';
    },
    async fetchData() {
      if (!this.currentWellId) {
        this.$message.warning('请先选择井号');
        return;
      }
      if (!this.searchForm.timeRange || this.searchForm.timeRange.length !== 2) {
        this.$message.warning('请选择完整时间范围');
        return;
      }

      const start = new Date(this.searchForm.timeRange[0].replace(' ', 'T'));
      const end = new Date(this.searchForm.timeRange[1].replace(' ', 'T'));
      const rangeHours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
      if (Number.isNaN(rangeHours) || rangeHours <= 0) {
        this.$message.warning('时间范围无效');
        return;
      }
      if (rangeHours > this.maxHistoryRangeHours) {
        this.$message.warning(`单次历史回放最多支持 ${this.maxHistoryRangeHours} 小时`);
        return;
      }

      this.loading = true;

      try {
        const response = await getUnifiedPtdHistoryApi({
          wellId: this.currentWellId,
          startTime: this.searchForm.timeRange[0].replace(' ', 'T'),
          endTime: this.searchForm.timeRange[1].replace(' ', 'T')
        });

        const normalized = normalizeHistoryResponse(response && response.data ? response.data : response);
        this.frames = normalized.frames;
        this.events = normalized.events;
        this.sampling = normalized.sampling;
        this.configVersionId = normalized.configVersionId;
        this.configVersion = normalized.configVersion;

        if (!this.frames.length) {
          this.$message.info('当前时间范围内未查询到有效数据');
        } else {
          this.$message.success(`历史复盘完成，共返回 ${this.frames.length} 个采样点`);
        }
      } catch (error) {
        this.$message.error(this.resolveHistoryRequestErrorMessage(error));
      } finally {
        this.loading = false;
      }
    },
    parseTimeToMs(value) {
      if (!value) {
        return NaN;
      }
      const normalized = value.includes('T') ? value : value.replace(' ', 'T');
      return new Date(normalized).getTime();
    },
    jumpToTimePoint() {
      if (!this.frames.length) {
        this.$message.warning('请先执行历史分析');
        return;
      }
      if (!this.searchForm.jumpTime) {
        this.$message.warning('请输入要跳转的时间点');
        return;
      }
      const targetMs = this.parseTimeToMs(this.searchForm.jumpTime);
      if (!Number.isFinite(targetMs)) {
        this.$message.warning('跳转时间格式无效');
        return;
      }
      const firstMs = this.frames[0].timestampMs;
      const lastMs = this.frames[this.frames.length - 1].timestampMs;
      if (targetMs < firstMs || targetMs > lastMs) {
        this.$message.warning('跳转时间需要落在当前已回放的数据区间内');
        return;
      }
      const dashboard = this.$refs.riskDashboard;
      if (!dashboard || typeof dashboard.jumpToTimestamp !== 'function') {
        this.$message.error('图表组件尚未就绪');
        return;
      }
      const jumped = dashboard.jumpToTimestamp(this.searchForm.jumpTime);
      if (!jumped) {
        this.$message.warning('当前时间点暂时无法定位，请稍后再试');
      }
    },
    handleStatusUpdated({ eventId, status }) {
      this.events = this.events.map(item => {
        if (item.eventId !== eventId) {
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

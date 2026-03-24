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
            启动历史分析
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
        <span v-if="configVersion">配置版本 {{ configVersion }}</span>
      </div>
    </el-card>

    <PtdRiskDashboard
      ref="riskDashboard"
      :frames="frames"
      :events="events"
      :sampling="sampling"
      :config-version="configVersion"
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
      loading-text="正在分析历史区间并生成统一风险轨迹，请稍候..."
      empty-text="请选择时间范围后执行历史分析。"
      @status-updated="handleStatusUpdated" />
  </div>
</template>

<script>
import PtdRiskDashboard from './PtdRiskDashboard.vue';
import { getPtdAnalysisHistoryApi } from '@/api/index';
import {
  buildDefaultTimeRange,
  normalizeHistoryResponse
} from '@/utils/ptdRisk';

const MAX_HISTORY_RANGE_HOURS = 6;

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
        const response = await getPtdAnalysisHistoryApi({
          wellId: this.currentWellId,
          startTime: this.searchForm.timeRange[0].replace(' ', 'T'),
          endTime: this.searchForm.timeRange[1].replace(' ', 'T')
        });

        const normalized = normalizeHistoryResponse(response && response.data ? response.data : response);
        this.frames = normalized.frames;
        this.events = normalized.events;
        this.sampling = normalized.sampling;
        this.configVersion = normalized.configVersion;

        if (!this.frames.length) {
          this.$message.info('当前时间范围内未查询到有效数据');
        } else {
          this.$message.success(`历史分析完成，共返回 ${this.frames.length} 个采样点`);
        }
      } catch (error) {
        this.$message.error('历史分析失败');
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

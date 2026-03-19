<template>
  <div class="ptd-dashboard">
    <div v-if="!hasData && !loading" class="empty-box">
      <i class="el-icon-data-analysis"></i>
      <div>{{ emptyText }}</div>
    </div>

    <div v-else-if="loading && !hasData" class="loading-box">
      <i class="el-icon-loading"></i>
      <div class="loading-title">正在准备监测数据</div>
      <div class="loading-desc">{{ loadingText }}</div>
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
          <div class="summary-card" :class="{ 'summary-card-clickable': !showEventTableInline }" @click="openEventOverview">
            <div class="summary-label">事件态势</div>
            <div class="summary-value">事件 {{ visibleEventCount }} 个</div>
            <div class="summary-meta">
              <span>L1 {{ severityCounts.L1 }}</span>
              <span>L2 {{ severityCounts.L2 }}</span>
              <span>L3 {{ severityCounts.L3 }}</span>
              <span>默认视窗 {{ defaultWindowMinutes }}min</span>
            </div>
            <div v-if="!showEventTableInline" class="summary-meta summary-entry">
              <el-button type="text" class="summary-entry-button" @click.stop="openEventOverview">查看异常事件闭环</el-button>
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
          <div class="action-row compact-actions">
            <el-button v-if="showEventLocateAction" size="mini" type="primary" plain @click="jumpToEvent(highlightEvent)">定位区间</el-button>
            <el-button v-if="showEventEvidenceAction" size="mini" plain @click="openEventDetail(highlightEvent)">查看详情</el-button>
          </div>
        </div>
      </el-card>

      <el-card v-for="layout in chartLayouts" :key="layout.key" shadow="never" class="chart-card chart-panel" :body-style="{ padding: '0' }">
        <div :ref="layout.ref" class="chart-canvas" :style="{ height: `${layout.height || 420}px` }"></div>
      </el-card>

      <el-card v-if="showEventTableInline" shadow="never" class="chart-card">
        <div slot="header" class="chart-head">
          <span>异常事件闭环</span>
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
            <el-table v-if="isGroupExpanded(group.name)" :data="group.events" :row-key="getEventRowKey" border stripe size="small" :row-class-name="getEventRowClassName">
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
              <el-table-column v-if="showEventStatusColumn" label="状态" :min-width="showEventActions ? 110 : 150" align="center">
                <template slot-scope="{ row }">
                  <el-tag size="small" effect="plain" :type="getStatusMetaFor(row.status).type">{{ getStatusMetaFor(row.status).label }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="showActionColumn" label="操作" :min-width="actionColumnMinWidth">
                <template slot-scope="{ row }">
                  <el-button v-if="showEventLocateAction" size="mini" type="text" @click="jumpToEvent(row)">定位</el-button>
                  <el-button v-if="showEventEvidenceAction" size="mini" type="text" @click="openEventDetail(row)">详情</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'ACKNOWLEDGED'" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'PROCESSING'" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'CLOSED'" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>

        <el-table v-else :data="sortedEvents" :row-key="getEventRowKey" border stripe size="small" :row-class-name="getEventRowClassName">
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
          <el-table-column v-if="showEventStatusColumn" label="状态" :min-width="showEventActions ? 110 : 140" align="center">
            <template slot-scope="{ row }">
              <el-tag size="small" effect="plain" :type="getStatusMetaFor(row.status).type">{{ getStatusMetaFor(row.status).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="showActionColumn" label="操作" :min-width="actionColumnMinWidth">
            <template slot-scope="{ row }">
              <el-button v-if="showEventLocateAction" size="mini" type="text" @click="jumpToEvent(row)">定位</el-button>
              <el-button v-if="showEventEvidenceAction" size="mini" type="text" @click="openEventDetail(row)">详情</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'ACKNOWLEDGED'" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'PROCESSING'" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'CLOSED'" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <el-dialog
      v-if="!showEventTableInline"
      :visible.sync="eventOverviewVisible"
      width="1280px"
      title="异常事件闭环"
      destroy-on-close
      @closed="handleLocateDialogClosed"
      append-to-body>
      <div class="summary-meta dialog-meta">
        <span>事件 {{ visibleEventCount }} 个</span>
        <span>L1 {{ severityCounts.L1 }}</span>
        <span>L2 {{ severityCounts.L2 }}</span>
        <span>L3 {{ severityCounts.L3 }}</span>
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
          <el-table v-if="isGroupExpanded(group.name)" :data="group.events" :row-key="getEventRowKey" border stripe size="small" :row-class-name="getEventRowClassName">
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
            <el-table-column v-if="showEventStatusColumn" label="状态" :min-width="showEventActions ? 110 : 150" align="center">
              <template slot-scope="{ row }">
                <el-tag size="small" effect="plain" :type="getStatusMetaFor(row.status).type">{{ getStatusMetaFor(row.status).label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="showActionColumn" label="操作" :min-width="actionColumnMinWidth">
              <template slot-scope="{ row }">
                <el-button v-if="showEventLocateAction" size="mini" type="text" @click="jumpToEvent(row)">定位</el-button>
                <el-button v-if="showEventEvidenceAction" size="mini" type="text" @click="openEventDetail(row)">详情</el-button>
                <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'ACKNOWLEDGED'" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
                <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'PROCESSING'" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
                <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'CLOSED'" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <el-table v-else :data="sortedEvents" :row-key="getEventRowKey" border stripe size="small" :row-class-name="getEventRowClassName">
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
        <el-table-column v-if="showEventStatusColumn" label="状态" :min-width="showEventActions ? 110 : 140" align="center">
          <template slot-scope="{ row }">
            <el-tag size="small" effect="plain" :type="getStatusMetaFor(row.status).type">{{ getStatusMetaFor(row.status).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="showActionColumn" label="操作" :min-width="actionColumnMinWidth">
          <template slot-scope="{ row }">
            <el-button v-if="showEventLocateAction" size="mini" type="text" @click="jumpToEvent(row)">定位</el-button>
            <el-button v-if="showEventEvidenceAction" size="mini" type="text" @click="openEventDetail(row)">详情</el-button>
            <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'ACKNOWLEDGED'" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
            <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'PROCESSING'" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
            <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusBusy(row.eventId) || row.status === 'CLOSED'" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :visible.sync="detailVisible" width="1080px" :title="selectedEventView ? `事件详情 - ${selectedEventView.riskType}` : '事件详情'" @closed="handleLocateDialogClosed">
      <template v-if="selectedEventView">
        <div class="summary-meta dialog-meta">
          <el-tag size="small" effect="dark" :type="getSeverityMetaFor(selectedEventView.severity, selectedEventView.severityLevel).tagType">{{ selectedEventView.severity }}</el-tag>
          <el-tag v-if="showEventStatusColumn" size="small" effect="plain" :type="getStatusMetaFor(selectedEventView.status).type">{{ getStatusMetaFor(selectedEventView.status).label }}</el-tag>
          <span>{{ selectedEventView.startTimeLabel }}</span>
          <span>{{ selectedEventView.endTimeLabel }}</span>
          <span>{{ formatDuration(selectedEventView.durationSec) }}</span>
          <span v-if="selectedEventView.configVersion">配置 {{ selectedEventView.configVersion }}</span>
        </div>
        <div v-if="showDetailActionRow" class="action-row dialog-actions compact-actions">
          <el-button v-if="showEventLocateAction" size="mini" type="primary" plain @click="jumpToEvent(selectedEventView)">定位区间</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="warning" plain :disabled="isStatusBusy(selectedEventView.eventId) || selectedEventView.status === 'ACKNOWLEDGED'" @click="updateStatus(selectedEventView, 'ACKNOWLEDGED')">确认</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="info" plain :disabled="isStatusBusy(selectedEventView.eventId) || selectedEventView.status === 'PROCESSING'" @click="updateStatus(selectedEventView, 'PROCESSING')">处理中</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="success" plain :disabled="isStatusBusy(selectedEventView.eventId) || selectedEventView.status === 'CLOSED'" @click="updateStatus(selectedEventView, 'CLOSED')">关闭</el-button>
        </div>
        <el-skeleton v-if="detailLoading" :rows="4" animated />
        <template v-else>
          <div v-if="detailSnapshot.timestampLabel !== '-'" class="detail-section">
            <div class="summary-label">事件快照</div>
            <div class="summary-meta">
              <span>时间 {{ detailSnapshot.timestampLabel }}</span>
              <span>工况 {{ detailSnapshot.activityBucket || detailSnapshot.activityCode || '-' }}</span>
              <span>井深 {{ formatNumber(detailSnapshot.depth, 2) }}</span>
            </div>
            <el-table :data="detailMetricRows" border size="small" class="detail-table">
              <el-table-column prop="label" label="指标" min-width="170" />
              <el-table-column prop="unit" label="单位" width="80" align="center" />
              <el-table-column label="原值" width="110" align="center">
                <template slot-scope="{ row }">{{ formatNumber(row.originalValue, 3) }}</template>
              </el-table-column>
              <el-table-column label="基线" width="110" align="center">
                <template slot-scope="{ row }">{{ formatNumber(row.baseline, 3) }}</template>
              </el-table-column>
              <el-table-column label="PTD" width="110" align="center">
                <template slot-scope="{ row }">{{ formatNumber(row.ptdValue, 3) }}</template>
              </el-table-column>
              <el-table-column label="方向" width="90" align="center">
                <template slot-scope="{ row }">
                  <el-tag size="mini" :type="directionTagType(row.direction)">{{ directionText(row.direction) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="异常" width="90" align="center">
                <template slot-scope="{ row }">
                  <el-tag size="mini" :type="row.isAnomaly ? 'danger' : 'info'">{{ row.isAnomaly ? '是' : '否' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="note" label="说明" min-width="220" />
            </el-table>
          </div>

          <div class="detail-section">
            <div class="summary-label">触发证据</div>
            <el-table :data="selectedEventView.evidence" border size="small" class="detail-table">
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
          </div>

          <div v-if="selectedEventActionLogs.length" class="detail-section">
            <div class="summary-label">闭环操作日志</div>
            <el-table :data="selectedEventActionLogs" border size="small" class="detail-table">
              <el-table-column prop="actionTimeLabel" label="时间" width="180" />
              <el-table-column prop="operator" label="操作人" width="120" />
              <el-table-column prop="actionType" label="动作" width="140" />
              <el-table-column label="状态变化" width="180" align="center">
                <template slot-scope="{ row }">
                  {{ getStatusMetaFor(row.beforeStatus).label }} -> {{ getStatusMetaFor(row.afterStatus).label }}
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="220" />
            </el-table>
          </div>
        </template>
      </template>
    </el-dialog>

    <transition name="locate-fade">
      <div v-if="isLocating" class="locating-mask">
        <div class="locating-panel">
          <i class="el-icon-loading"></i>
          <div class="locating-title">正在定位风险曲线</div>
          <div class="locating-desc">{{ locateLoadingText }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getPtdEventDetailApi, updatePtdEventStatusApi } from '@/api/index';
import { formatDateTime, formatDuration, formatNumber, getSeverityMeta, getStatusMeta, normalizeEventDetailResponse } from '@/utils/ptdRisk';

const CHART_HEADER_TOP = 18;
const CHART_HEADER_HEIGHT = 18;
const CHART_GRID_TOP = 84;

const CHART_LAYOUTS = [
  { key: 'overview', ref: 'chartOverview', title: '风险等级曲线', type: 'overview', height: 280 },
  { key: 'standpipePress', ref: 'chartSpp', title: '立管压力 SPPA', type: 'metric', metricKey: 'standpipePress', color: '#0f766e', height: 400 },
  { key: 'outletFlow', ref: 'chartFlow', title: '出口流量 MFOA', type: 'metric', metricKey: 'outletFlow', color: '#2563eb', height: 400 },
  { key: 'poolVolume', ref: 'chartVolume', title: '总池体积 TVOLACT', type: 'metric', metricKey: 'poolVolume', color: '#7c3aed', height: 400 },
  { key: 'hookLoad', ref: 'chartHook', title: '钩载 HKLA', type: 'metric', metricKey: 'hookLoad', color: '#ea580c', height: 400 },
  { key: 'torque', ref: 'chartTorque', title: '扭矩 TORQA', type: 'metric', metricKey: 'torque', color: '#be123c', height: 400 },
  { key: 'rop', ref: 'chartRop', title: '钻时 ROPA', type: 'metric', metricKey: 'rop', color: '#475569', height: 400 },
  { key: 'pitFlow', ref: 'chartPitFlow', title: '总池体积变化 + 流量差', type: 'composite', height: 400, seriesDefs: [{ metricKey: 'pitGain', name: '池增量 ΔTVOLACT', color: '#0f766e', axisName: 'm³', position: 'left' }, { metricKey: 'flowBalance', name: '流量差 ΔFlow', color: '#2563eb', axisName: 'L/s', position: 'right' }, { metricKey: 'flowBalanceIntegral', name: '流量差积分 ΔFlow_int', color: '#dc2626', axisName: 'L', position: 'right', offset: 88 }] },
  { key: 'pumpFlowIn', ref: 'chartPumpFlowIn', title: '泵冲 + 入口流量', type: 'composite', height: 400, seriesDefs: [{ metricKey: 'pumpSpmTotal', name: '总泵冲 SPM', color: '#0284c7', axisName: 'spm', position: 'left' }, { metricKey: 'flowIn', name: '入口流量 MFIA', color: '#16a34a', axisName: 'L/s', position: 'right' }] },
  { key: 'gasChoke', ref: 'chartGasChoke', title: '全烃 + 套压', type: 'composite', height: 400, seriesDefs: [{ metricKey: 'gas', name: '全烃 GASA', color: '#ca8a04', axisName: '%', position: 'left' }, { metricKey: 'chokePressure', name: '套压 CHKP', color: '#7c2d12', axisName: 'MPa', position: 'right' }] }
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
    loadingText: { type: String, default: '正在准备数据，请稍候...' },
    allowStatusUpdate: { type: Boolean, default: true },
    showHighlight: { type: Boolean, default: true },
    groupEvents: { type: Boolean, default: false },
    showEventActions: { type: Boolean, default: true },
    showEventLocateAction: { type: Boolean, default: true },
    showEventEvidenceAction: { type: Boolean, default: true },
    showEventStatusColumn: { type: Boolean, default: true },
    showEventTableInline: { type: Boolean, default: true },
    defaultWindowMinutes: { type: Number, default: 20 },
    autoFollowLatest: { type: Boolean, default: false },
    eventLocatePaddingMinutes: { type: Number, default: 2 },
    hideHighlightWhenNormal: { type: Boolean, default: false }
    },
    data() {
      return { chartLayouts: CHART_LAYOUTS, chartInstances: {}, eventOverviewVisible: false, detailVisible: false, detailLoading: false, selectedEventId: '', selectedEventDetail: null, selectedEventActionLogs: [], resizeObserver: null, zoomRange: null, manualZoomLocked: false, syncingZoom: false, expandedGroupNames: [], renderTimer: null, axisRefreshTimer: null, zoomCaptureRaf: null, pendingZoomRange: null, highlightRange: null, highlightTimer: null, locateTimer: null, locateFinishTimer: null, pendingLocateEvent: null, pendingLocateDialogCloseCount: 0, isLocating: false, locateLoadingText: '正在定位到风险曲线，请稍候...', statusLoadingMap: {} };
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
      this.sortedEvents.forEach((item) => {
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
      if (this.pageMode === 'realtime') {
        if (this.activeEvents.length) return this.activeEvents[0];
        return this.sortedEvents.find(item => item.severityLevel > 0) || null;
      }
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
    visibleEventCount() { return (this.events || []).filter(item => (item.severityLevel || 0) > 0).length; },
    showActionColumn() { return this.showEventLocateAction || this.showEventEvidenceAction || this.allowStatusUpdate; },
    showDetailActionRow() { return this.showEventLocateAction || this.allowStatusUpdate; },
    actionColumnMinWidth() {
      let width = 110;
      if (this.showEventLocateAction) width += 50;
      if (this.showEventEvidenceAction) width += 50;
      if (this.allowStatusUpdate) width += 150;
      return width;
    },
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
      selectedEventView() { return this.selectedEventDetail || this.selectedEvent; },
      expandedGroupLookup() {
        if (!this.groupEvents) return {};
        const names = Array.isArray(this.expandedGroupNames)
          ? this.expandedGroupNames
          : [this.expandedGroupNames].filter(Boolean);
        return names.reduce((acc, name) => {
          acc[name] = true;
          return acc;
        }, {});
      },
      detailSnapshot() {
        const snapshot = this.selectedEventView && this.selectedEventView.snapshot ? this.selectedEventView.snapshot : {};
        return Object.assign({
        timestampLabel: '-',
        activityCode: '',
        activityBucket: '',
        depth: null,
        metrics: {}
      }, snapshot || {});
    },
    detailMetricRows() {
      const metrics = this.detailSnapshot.metrics || {};
      return Object.keys(metrics)
        .map(key => metrics[key])
        .filter(item => item && item.label);
    },
    datasetKey() {
      const latestEvent = this.sortedEvents[0];
      return [this.frames.length, this.latestFrame ? this.latestFrame.timestampMs : 0, this.events.length, latestEvent ? latestEvent.eventId : '', latestEvent ? latestEvent.endTimeMs : 0].join('|');
    },
    chartMarkAreas() {
      const eventAreas = (this.events || []).map(item => [
        {
          xAxis: item.startTimeMs,
          itemStyle: { color: getSeverityMeta(item.severity, item.severityLevel).areaColor }
        },
        {
          xAxis: item.endTimeMs > item.startTimeMs ? item.endTimeMs : item.startTimeMs + 1000
        }
      ]);
      if (!this.highlightRange) {
        return eventAreas;
      }

      return eventAreas.concat([[
        {
          xAxis: this.highlightRange.startValue,
          itemStyle: { color: 'rgba(250, 204, 21, 0.38)' }
        },
        {
          xAxis: Math.max(this.highlightRange.startValue + 1000, this.highlightRange.endValue)
        }
      ]]);
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
      return { metrics, severity, newEvents, frameMap };
    }
  },
  watch: {
    datasetKey() {
      this.ensureSelectedEvent();
      this.ensureZoomRange();
      this.ensureExpandedGroups();
      this.scheduleRender();
    },
    detailVisible(value) {
      if (!value) {
        this.detailLoading = false;
        this.selectedEventDetail = null;
        this.selectedEventActionLogs = [];
      }
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
      if (this.axisRefreshTimer) clearTimeout(this.axisRefreshTimer);
      if (this.zoomCaptureRaf && window.cancelAnimationFrame) window.cancelAnimationFrame(this.zoomCaptureRaf);
      if (this.highlightTimer) clearTimeout(this.highlightTimer);
      if (this.locateTimer) clearTimeout(this.locateTimer);
      if (this.locateFinishTimer) clearTimeout(this.locateFinishTimer);
      this.disposeCharts();
    },
    methods: {
    formatNumber,
    formatDuration,
    getSeverityMetaFor(severity, level) { return getSeverityMeta(severity, level); },
    getStatusMetaFor(status) { return getStatusMeta(status); },
    getEventRowKey(row) { return row.eventId || row.recordId || `${row.startTimeMs || 0}-${row.riskType || ''}`; },
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
    isGroupExpanded(name) {
      return Boolean(this.expandedGroupLookup[name]);
    },
    openEventOverview() {
      if (this.showEventTableInline) return;
      this.eventOverviewVisible = true;
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
    buildCenteredZoomRange(centerMs, halfWindowMs) {
      if (!this.hasData) return null;
      const first = this.earliestFrame.timestampMs;
      const last = this.latestFrame.timestampMs;
      const totalWindowMs = Math.max(1000, halfWindowMs * 2);
      let startValue = centerMs - halfWindowMs;
      let endValue = centerMs + halfWindowMs;

      if (startValue < first) {
        endValue = Math.min(last, endValue + (first - startValue));
        startValue = first;
      }

      if (endValue > last) {
        startValue = Math.max(first, startValue - (endValue - last));
        endValue = last;
      }

      if ((endValue - startValue) < totalWindowMs && (last - first) > (endValue - startValue)) {
        const missing = totalWindowMs - (endValue - startValue);
        startValue = Math.max(first, startValue - (missing / 2));
        endValue = Math.min(last, endValue + (missing / 2));
      }

      return this.normalizeZoomRange({ startValue, endValue });
    },
    resolveVisibleAxisRange() {
      return this.zoomRange
        ? this.normalizeZoomRange(this.zoomRange)
        : this.buildDefaultZoomRange();
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
    beginLocateFeedback(message) {
      if (this.locateFinishTimer) {
        clearTimeout(this.locateFinishTimer);
        this.locateFinishTimer = null;
      }
      this.locateLoadingText = message || '正在定位到风险曲线，请稍候...';
      this.isLocating = true;
    },
    finishLocateFeedback(delay = 420) {
      if (this.locateFinishTimer) clearTimeout(this.locateFinishTimer);
      this.locateFinishTimer = setTimeout(() => {
        this.locateFinishTimer = null;
        this.isLocating = false;
      }, delay);
    },
    setTransientHighlight(eventItem) {
      if (!eventItem) return;
      const startValue = eventItem.startTimeMs || (this.latestFrame ? this.latestFrame.timestampMs : 0);
      const endValue = Math.max(startValue + 1000, eventItem.endTimeMs || startValue);
      this.highlightRange = { startValue, endValue };
      if (this.highlightTimer) clearTimeout(this.highlightTimer);
      this.refreshHighlightAreas();
      this.highlightTimer = setTimeout(() => {
        this.highlightRange = null;
        this.refreshHighlightAreas();
      }, 2400);
    },
    refreshHighlightAreas() {
      const hasCharts = Object.keys(this.chartInstances).length > 0;
      if (!hasCharts) {
        this.scheduleRender();
        return;
      }
      const markAreaPatch = { silent: true, data: this.chartMarkAreas };
      this.chartLayouts.forEach((layout) => {
        const chart = this.chartInstances[layout.key];
        if (!chart) return;
        chart.setOption({ series: [{ markArea: markAreaPatch }] }, false, true);
      });
    },
    async openEventDetail(eventItem) {
      if (!eventItem) return;
      this.selectedEventId = eventItem.eventId;
      this.selectedEventDetail = null;
      this.selectedEventActionLogs = [];
      this.detailVisible = true;
      if (!eventItem.recordId) return;
      this.detailLoading = true;
      try {
        const response = await getPtdEventDetailApi({ recordId: eventItem.recordId });
        const detail = normalizeEventDetailResponse(response && response.data ? response.data : response);
        this.selectedEventDetail = detail.event;
        this.selectedEventActionLogs = detail.actionLogs;
      } catch (error) {
        this.selectedEventDetail = null;
        this.selectedEventActionLogs = [];
        this.$message.error('事件详情加载失败');
      } finally {
        this.detailLoading = false;
      }
    },
    rangesEqual(firstRange, secondRange) {
      if (!firstRange && !secondRange) return true;
      if (!firstRange || !secondRange) return false;
      return firstRange.startValue === secondRange.startValue && firstRange.endValue === secondRange.endValue;
    },
    queueLocate(eventItem) {
      this.pendingLocateEvent = null;
      if (this.locateTimer) {
        clearTimeout(this.locateTimer);
      }
      this.locateTimer = setTimeout(() => {
        this.locateTimer = null;
        this.$nextTick(() => {
          if (window.requestAnimationFrame) {
            window.requestAnimationFrame(() => this.performEventLocate(eventItem));
            return;
          }
          this.performEventLocate(eventItem);
        });
      }, 24);
    },
    performEventLocate(eventItem) {
      if (!eventItem || !this.hasData) return;
      this.selectedEventId = eventItem.eventId;
      this.setTransientHighlight(eventItem);
      this.manualZoomLocked = true;
      const eventStart = eventItem.startTimeMs || this.earliestFrame.timestampMs;
      const eventEnd = Math.max(eventStart, eventItem.endTimeMs || eventStart);
      const eventDurationMs = Math.max(1000, eventEnd - eventStart);
      const defaultWindowMs = Math.max(1, this.defaultWindowMinutes) * 60 * 1000;
      const paddingMs = Math.max(0, this.eventLocatePaddingMinutes) * 60 * 1000;
      const contextPaddingMs = Math.max(paddingMs, eventDurationMs * 0.5);
      const halfWindowMs = Math.max(defaultWindowMs / 2, eventDurationMs / 2 + contextPaddingMs);
      const centerMs = eventStart + ((eventEnd - eventStart) / 2);
      const nextZoomRange = this.buildCenteredZoomRange(centerMs, halfWindowMs);
      const zoomChanged = !this.rangesEqual(this.zoomRange, nextZoomRange);
      this.zoomRange = nextZoomRange;
      if (zoomChanged) {
        this.applyZoomRange();
      } else {
        this.scheduleAxisRefresh(true);
      }
      this.scrollChartsIntoView();
      this.finishLocateFeedback(520);
    },
    handleLocateDialogClosed() {
      if (!this.pendingLocateEvent || this.pendingLocateDialogCloseCount <= 0) return;
      this.pendingLocateDialogCloseCount = Math.max(0, this.pendingLocateDialogCloseCount - 1);
      if (this.pendingLocateDialogCloseCount === 0) {
        const targetEvent = this.pendingLocateEvent;
        this.queueLocate(targetEvent);
      }
    },
    jumpToEvent(eventItem) {
      if (!eventItem || !this.hasData || this.isLocating) return;
      if (this.locateTimer) {
        clearTimeout(this.locateTimer);
        this.locateTimer = null;
      }
      const dialogCloseCount = (this.eventOverviewVisible ? 1 : 0) + (this.detailVisible ? 1 : 0);
      const fromDialog = dialogCloseCount > 0;
      this.beginLocateFeedback(fromDialog ? '正在关闭弹窗并定位到风险曲线，请稍候...' : '正在定位到风险曲线，请稍候...');
      if (fromDialog) {
        this.pendingLocateEvent = eventItem;
        this.pendingLocateDialogCloseCount = dialogCloseCount;
        this.eventOverviewVisible = false;
        this.detailVisible = false;
        return;
      }
      this.queueLocate(eventItem);
    },
    async updateStatus(eventItem, status) {
      if (!eventItem || !eventItem.eventId || eventItem.status === status || this.isStatusBusy(eventItem.eventId)) return;
      const previousStatus = eventItem.status;
      this.$set(this.statusLoadingMap, eventItem.eventId, true);
      this.$emit('status-updated', { eventId: eventItem.eventId, recordId: eventItem.recordId, status });
      try {
        const response = await updatePtdEventStatusApi({ recordId: eventItem.recordId, analysisRunId: eventItem.analysisRunId, eventId: eventItem.eventId, status });
        const nextStatus = response && response.data && response.data.status ? response.data.status : status;
        if (nextStatus !== status) {
          this.$emit('status-updated', { eventId: eventItem.eventId, recordId: eventItem.recordId, status: nextStatus });
        }
        if (this.selectedEventDetail && this.selectedEventDetail.eventId === eventItem.eventId) {
          this.selectedEventDetail = { ...this.selectedEventDetail, status: nextStatus };
        }
        this.$message.success(`事件状态已更新为 ${getStatusMeta(nextStatus).label}`);
      } catch (error) {
        this.$emit('status-updated', { eventId: eventItem.eventId, recordId: eventItem.recordId, status: previousStatus });
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
      }, this.pageMode === 'realtime' ? 120 : 16);
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
    axisExtent(seriesList, range = undefined) {
      const activeRange = range === undefined ? this.resolveVisibleAxisRange() : range;
      let min = null;
      let max = null;
      (seriesList || []).forEach((series) => {
        (series || []).forEach((item) => {
          if (!Array.isArray(item)) return;
          const timestamp = Number(item[0]);
          if (activeRange && Number.isFinite(timestamp) && (timestamp < activeRange.startValue || timestamp > activeRange.endValue)) {
            return;
          }
          const value = item[1];
          if (!valid(value)) return;
          const numeric = Number(value);
          min = min === null ? numeric : Math.min(min, numeric);
          max = max === null ? numeric : Math.max(max, numeric);
        });
      });
      if (min === null || max === null) {
        if (activeRange) {
          return this.axisExtent(seriesList, null);
        }
        return {};
      }
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
      const zoom = this.resolveVisibleAxisRange();
      const baseOption = {
        animation: false,
        animationThreshold: 1000,
        hoverLayerThreshold: 2000,
        title: {
          text: '',
          left: 18,
          top: CHART_HEADER_TOP,
          padding: [2, 0, 0, 0],
          textStyle: { fontSize: 11, lineHeight: CHART_HEADER_HEIGHT, color: '#475569', fontWeight: 500, verticalAlign: 'middle' }
        },
        legend: {
          top: CHART_HEADER_TOP,
          right: 20,
          padding: 0,
          itemWidth: 18,
          itemHeight: 10,
          textStyle: { color: '#475569', fontSize: 11, lineHeight: 11 }
        },
        grid: { left: 72, right: 84, top: CHART_GRID_TOP, bottom: 48, containLabel: false },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, confine: true, transitionDuration: 0 },
        dataZoom: [
          { type: 'inside', filterMode: 'none', throttle: 80, startValue: zoom ? zoom.startValue : undefined, endValue: zoom ? zoom.endValue : undefined },
          {
            type: 'slider',
            filterMode: 'none',
            realtime: true,
            throttle: 80,
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
      };
      return {
        ...baseOption,
        ...extra,
        title: { ...baseOption.title, ...(extra.title || {}) },
        legend: { ...baseOption.legend, ...(extra.legend || {}) },
        grid: { ...baseOption.grid, ...(extra.grid || {}) },
        tooltip: { ...baseOption.tooltip, ...(extra.tooltip || {}) },
        xAxis: { ...baseOption.xAxis, ...(extra.xAxis || {}) }
      };
    },
    buildLineSeries(extra = {}) {
      return Object.assign({
        type: 'line',
        showSymbol: false,
        animation: false,
        hoverAnimation: false,
        sampling: 'lttb',
        progressive: 500,
        progressiveThreshold: 1000
      }, extra);
    },
    buildScatterSeries(extra = {}) {
      return Object.assign({
        type: 'scatter',
        animation: false,
        hoverAnimation: false,
        progressive: 500,
        progressiveThreshold: 1000
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
          this.buildLineSeries({ name: '风险等级', step: 'end', lineStyle: { width: 2, color: '#d97706' }, itemStyle: { color: '#d97706' }, markArea: { silent: true, data: this.chartMarkAreas }, data: this.dashboardDataset.severity }),
          this.buildScatterSeries({ name: '新事件', symbolSize: 10, itemStyle: { color: '#dc2626' }, data: this.dashboardDataset.newEvents })
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
      return this.buildBaseOption({ title: { text: layout.title }, tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params) }, yAxis: [this.buildValueAxis(unit ? `原值 (${unit})` : '原值', layout.color, [series.raw, series.baseline, series.anomalies], 'left', 0, true), this.buildValueAxis('PTD / MAD', '#9333ea', [series.ptd, series.upper, series.lower], 'right', 0, false)], series: [this.buildLineSeries({ name: '原值', yAxisIndex: 0, lineStyle: { width: 2, color: layout.color }, itemStyle: { color: layout.color }, markArea: { silent: true, data: this.chartMarkAreas }, data: series.raw }), this.buildLineSeries({ name: '基线', yAxisIndex: 0, lineStyle: { width: 1, type: 'dashed', color: '#64748b' }, itemStyle: { color: '#64748b' }, data: series.baseline }), this.buildLineSeries({ name: 'PTD', yAxisIndex: 1, lineStyle: { width: 1.5, color: '#9333ea' }, itemStyle: { color: '#9333ea' }, data: series.ptd }), this.buildLineSeries({ name: '上阈', yAxisIndex: 1, lineStyle: { width: 1, type: 'dashed', color: '#dc2626' }, itemStyle: { color: '#dc2626' }, data: series.upper }), this.buildLineSeries({ name: '下阈', yAxisIndex: 1, lineStyle: { width: 1, type: 'dashed', color: '#2563eb' }, itemStyle: { color: '#2563eb' }, data: series.lower }), this.buildScatterSeries({ name: '异常点', yAxisIndex: 0, symbolSize: 7, itemStyle: { color: '#dc2626' }, data: series.anomalies })] });
    },
    buildCompositeOption(layout) {
      const yAxis = layout.seriesDefs.map(item => this.buildValueAxis(item.axisName || item.name, item.color, [this.dashboardDataset.metrics[item.metricKey].raw], item.position || 'left', item.offset || 0, item.position !== 'right' || !item.offset));
      const series = layout.seriesDefs.map((item, index) => this.buildLineSeries({ name: item.name, yAxisIndex: index, lineStyle: { width: 2, color: item.color }, itemStyle: { color: item.color }, markArea: index === 0 ? { silent: true, data: this.chartMarkAreas } : undefined, data: this.dashboardDataset.metrics[item.metricKey].raw }));
      return this.buildBaseOption({ title: { text: layout.title }, grid: { left: 72, right: layout.seriesDefs.length >= 3 ? 214 : 88, top: CHART_GRID_TOP, bottom: 48 }, tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params) }, yAxis, series });
    },
    buildChartOption(layout) {
      if (layout.type === 'overview') return this.buildOverviewOption();
      if (layout.type === 'metric') return this.buildMetricOption(layout);
      return this.buildCompositeOption(layout);
    },
    buildZoomPatch() {
      const zoom = this.resolveVisibleAxisRange();
      return [
        { startValue: zoom ? zoom.startValue : undefined, endValue: zoom ? zoom.endValue : undefined },
        { startValue: zoom ? zoom.startValue : undefined, endValue: zoom ? zoom.endValue : undefined }
      ];
    },
    buildAxisPatch(layout) {
      if (!layout) return null;
      if (layout.type === 'overview') {
        return { dataZoom: this.buildZoomPatch() };
      }
      if (layout.type === 'metric') {
        const series = this.dashboardDataset.metrics[layout.metricKey];
        const unit = this.metricUnit(layout.metricKey);
        return {
          dataZoom: this.buildZoomPatch(),
          yAxis: [
            this.buildValueAxis(unit ? `原值 (${unit})` : '原值', layout.color, [series.raw, series.baseline, series.anomalies], 'left', 0, true),
            this.buildValueAxis('PTD / MAD', '#9333ea', [series.ptd, series.upper, series.lower], 'right', 0, false)
          ]
        };
      }
      return {
        dataZoom: this.buildZoomPatch(),
        yAxis: layout.seriesDefs.map(item => this.buildValueAxis(item.axisName || item.name, item.color, [this.dashboardDataset.metrics[item.metricKey].raw], item.position || 'left', item.offset || 0, item.position !== 'right' || !item.offset))
      };
    },
    refreshVisibleAxes() {
      if (!this.hasData) return;
      this.chartLayouts.forEach((layout) => {
        const chart = this.chartInstances[layout.key];
        if (!chart) return;
        const patch = this.buildAxisPatch(layout);
        if (patch) {
          chart.setOption(patch, false, true);
        }
      });
    },
    scheduleAxisRefresh(immediate = false) {
      if (this.axisRefreshTimer) clearTimeout(this.axisRefreshTimer);
      if (immediate) {
        this.refreshVisibleAxes();
        return;
      }
      this.axisRefreshTimer = setTimeout(() => {
        this.axisRefreshTimer = null;
        this.refreshVisibleAxes();
      }, 160);
    },
    extractZoomRange(payload) {
      const source = payload && payload.batch && payload.batch.length ? payload.batch[0] : payload;
      if (!source || !this.hasData) return null;
      if (source.startValue !== undefined && source.endValue !== undefined) {
        return this.normalizeZoomRange({ startValue: source.startValue, endValue: source.endValue });
      }
      if (source.start !== undefined && source.end !== undefined) {
        const first = this.earliestFrame.timestampMs;
        const last = this.latestFrame.timestampMs;
        const span = Math.max(0, last - first);
        return this.normalizeZoomRange({
          startValue: first + (span * Number(source.start) / 100),
          endValue: first + (span * Number(source.end) / 100)
        });
      }
      return null;
    },
    captureZoom(payload) {
      if (this.syncingZoom || !this.hasData) return;
      const nextZoomRange = this.extractZoomRange(payload);
      if (!nextZoomRange) return;
      this.pendingZoomRange = nextZoomRange;
      if (this.zoomCaptureRaf) return;
      const commit = () => {
        this.zoomCaptureRaf = null;
        const committedZoomRange = this.pendingZoomRange;
        this.pendingZoomRange = null;
        if (!committedZoomRange) return;
        const changed = !this.zoomRange
          || committedZoomRange.startValue !== this.zoomRange.startValue
          || committedZoomRange.endValue !== this.zoomRange.endValue;
        this.manualZoomLocked = true;
        this.zoomRange = committedZoomRange;
        if (changed) {
          this.scheduleAxisRefresh();
        }
      };
      this.zoomCaptureRaf = window.requestAnimationFrame
        ? window.requestAnimationFrame(commit)
        : setTimeout(commit, 16);
    },
    getOrCreateChart(layout) {
      if (this.chartInstances[layout.key]) return this.chartInstances[layout.key];
      const target = this.$refs[layout.ref];
      const dom = Array.isArray(target) ? target[0] : target;
      if (!dom) return null;
      const chart = echarts.init(dom, null, { renderer: 'canvas' });
      chart.group = `ptd-risk-${this._uid}`;
      chart.on('dataZoom', params => this.captureZoom(params));
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
      this.$nextTick(() => {
        this.syncingZoom = false;
        this.scheduleAxisRefresh(true);
      });
    },
    scrollChartsIntoView() {
      const target = this.$refs[this.chartLayouts[0].ref];
      const dom = Array.isArray(target) ? target[0] : target;
      if (!dom) {
        return;
      }
      const anchor = dom.closest('.chart-card') || dom;
      const top = Math.max(0, window.pageYOffset + anchor.getBoundingClientRect().top - 4);
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
      if (typeof anchor.scrollIntoView === 'function') {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    renderAllCharts() {
      this.chartLayouts.forEach((layout) => {
        const chart = this.getOrCreateChart(layout);
        if (chart) chart.setOption(this.buildChartOption(layout), false, true);
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
.loading-box { padding: 54px 16px; border: 1px solid #dbeafe; border-radius: 12px; text-align: center; color: #1d4ed8; background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%); }
.loading-box i { font-size: 28px; }
.loading-title { margin-top: 12px; font-size: 18px; font-weight: 600; color: #0f172a; }
.loading-desc { margin-top: 8px; color: #475569; line-height: 1.7; }
.summary-card, .focus-card, .chart-card { border-radius: 12px; margin-top: 16px; }
.summary-card { min-height: 120px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; }
.summary-card-clickable { cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.summary-card-clickable:hover { border-color: #93c5fd; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12); }
.summary-label { color: #64748b; font-size: 12px; }
.summary-value { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; font-size: 18px; font-weight: 600; color: #0f172a; }
.summary-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; color: #475569; font-size: 12px; }
.summary-entry { margin-top: 8px; }
.summary-entry-button { padding: 0; font-size: 12px; }
.focus-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
.action-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.chart-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; color: #475569; }
.chart-head span:first-child { color: #0f172a; font-weight: 600; }
.chart-panel { overflow: hidden; }
.chart-canvas { width: 100%; }
.group-title-row, .group-meta { display: flex; align-items: center; gap: 10px; }
.group-title { font-weight: 600; }
.dialog-meta, .dialog-actions { margin-bottom: 12px; }
.dialog-actions { justify-content: flex-start; }
.compact-actions .el-button--mini { padding: 6px 10px; }
.locating-mask { position: fixed; inset: 0; z-index: 2100; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.14); backdrop-filter: blur(2px); }
.locating-panel { min-width: 260px; padding: 18px 22px; border-radius: 16px; background: rgba(255, 255, 255, 0.96); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18); text-align: center; }
.locating-panel i { font-size: 26px; color: #2563eb; }
.locating-title { margin-top: 10px; font-size: 16px; font-weight: 600; color: #0f172a; }
.locating-desc { margin-top: 8px; color: #475569; font-size: 12px; line-height: 1.7; }
.locate-fade-enter-active, .locate-fade-leave-active { transition: opacity 0.18s ease; }
.locate-fade-enter, .locate-fade-leave-to { opacity: 0; }
.detail-section { margin-bottom: 16px; }
.detail-table { margin-top: 12px; }
.event-row-active td { background: #fff7ed !important; }
</style>

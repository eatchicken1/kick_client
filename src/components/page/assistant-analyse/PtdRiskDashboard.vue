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
              <span>{{ latestFrame ? getDisplayRiskType(latestFrame) : '暂无风险事件' }}</span>
            </div>
            <div class="summary-meta">
              <span>井号 {{ currentWellId || '-' }}</span>
              <span>工况 {{ latestFrame ? getActivityBucketDisplay(latestFrame) : '-' }}</span>
              <span>井深 {{ formatDepthValue(latestFrame && latestFrame.depth) }}</span>
              <span>钻头深度 {{ formatDepthValue(latestFrame && latestFrame.bitDepth) }}</span>
              <span v-if="showFormationInfo">层位 {{ latestFrame && latestFrame.formationName ? latestFrame.formationName : '-' }}</span>
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
            <div class="summary-value summary-value-counts">
              <el-tag size="small" effect="dark" :type="getSeverityMetaFor('L1', 1).tagType">L1 {{ severityCounts.L1 }}</el-tag>
              <el-tag size="small" effect="dark" :type="getSeverityMetaFor('L2', 2).tagType">L2 {{ severityCounts.L2 }}</el-tag>
              <el-tag size="small" effect="dark" :type="getSeverityMetaFor('L3', 3).tagType">L3 {{ severityCounts.L3 }}</el-tag>
            </div>
            <div class="summary-meta">
              <span>默认视窗 {{ defaultWindowMinutes }}min</span>
            </div>
            <div class="summary-meta summary-entry summary-entry-actions">
              <el-button v-if="!showEventTableInline" type="text" class="summary-entry-button" @click.stop="openEventOverview">查看异常事件闭环</el-button>
              <el-button type="text" class="summary-entry-button subtle-entry-button" @click.stop="openRiskTree">查看风险树</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-card v-if="showHighlightCard" shadow="never" class="focus-card" :body-style="{ padding: '16px 18px 14px' }">
        <div class="focus-head">
          <div class="focus-main">
            <div class="summary-label">重点事件</div>
            <div class="summary-value">
              <el-tag size="small" effect="dark" :type="highlightSeverityMeta.tagType">{{ highlightSeverityMeta.code }}</el-tag>
              <span>{{ getDisplayRiskType(highlightEvent) }}</span>
              <el-tag size="mini" effect="plain" :type="highlightRiskTypeMeta.tagType">{{ highlightRiskTypeMeta.family }}</el-tag>
            </div>
            <div class="summary-meta focus-meta">
              <span>{{ highlightEvent.startTimeLabel }}</span>
              <span>{{ highlightEvent.endTimeLabel }}</span>
              <span>{{ formatDuration(highlightEvent.durationSec) }}</span>
              <span>{{ getStatusMetaFor(highlightEvent.status).label }}</span>
              <span v-if="highlightAutoCloseHint" class="focus-close-hint">{{ highlightAutoCloseHint }}</span>
            </div>
          </div>
          <div class="action-row compact-actions focus-actions">
            <el-button v-if="showEventLocateAction" size="mini" type="primary" plain class="focus-action-button" @click="jumpToEvent(highlightEvent)">定位</el-button>
            <el-button v-if="showEventEvidenceAction" size="mini" plain class="focus-action-button" @click="openEventDetail(highlightEvent)">详情</el-button>
            <el-button size="mini" plain class="focus-action-button" @click="dismissHighlightCard(highlightEvent)">关闭</el-button>
          </div>
        </div>
        <div class="focus-tree">
          <div class="focus-tree-root">
            <div class="focus-tree-node">
              <span class="focus-tree-label">根事件</span>
              <div class="focus-tree-text">
                <strong>{{ highlightRiskTypeMeta.family }}</strong>
                <span>{{ highlightRiskTypeMeta.summary }}</span>
              </div>
            </div>
          </div>
          <div class="focus-tree-branches">
            <div v-for="node in highlightReasonNodes" :key="node.key" class="focus-tree-branch">
              <span class="focus-tree-branch-label">{{ node.label }}</span>
              <span class="focus-tree-branch-text">{{ node.text }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <template v-for="layout in chartLayouts">
        <div v-if="layout.groupTitle" :key="`${layout.key}-group`" class="chart-group-head">
          <div class="chart-group-title">{{ layout.groupTitle }}</div>
          <div class="chart-group-desc">{{ layout.groupDesc }}</div>
        </div>
        <el-card :key="layout.key" shadow="never" class="chart-card chart-panel" :body-style="{ padding: '0' }">
          <div :ref="layout.ref" class="chart-canvas" :style="{ height: `${layout.height || 420}px` }"></div>
        </el-card>
      </template>

      <el-card v-if="showEventTableInline" shadow="never" class="chart-card">
        <div slot="header" class="chart-head">
          <span>异常事件闭环</span>
        </div>

          <el-collapse v-if="groupEvents && groupedEventGroups.length" v-model="expandedGroupNames">
            <el-collapse-item v-for="group in groupedEventGroups" :key="group.key" :name="group.key">
            <template slot="title">
              <div class="group-title-row">
                <span class="group-title">{{ group.title }}</span>
                <div class="group-meta">
                  <el-tag size="mini" effect="dark" :type="getSeverityMetaFor(group.severityCode, group.severityLevel).tagType">{{ group.severityCode }}</el-tag>
                  <span>{{ group.events.length }} 个</span>
                </div>
              </div>
            </template>
            <el-table v-if="isGroupExpanded(group.key)" :data="group.events" :row-key="getEventRowKey" border stripe size="small" :row-class-name="getEventRowClassName">
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
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'ACKNOWLEDGED')" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'PROCESSING')" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
                  <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'CLOSED')" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
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
          <el-table-column label="风险类型" min-width="220">
            <template slot-scope="{ row }">{{ getDisplayRiskType(row) }}</template>
          </el-table-column>
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
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'ACKNOWLEDGED')" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'PROCESSING')" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
              <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'CLOSED')" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
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
        <span>L1 {{ severityCounts.L1 }}</span>
        <span>L2 {{ severityCounts.L2 }}</span>
        <span>L3 {{ severityCounts.L3 }}</span>
      </div>

      <el-collapse v-if="groupEvents && groupedEventGroups.length" v-model="expandedGroupNames">
        <el-collapse-item v-for="group in groupedEventGroups" :key="group.key" :name="group.key">
          <template slot="title">
            <div class="group-title-row">
              <span class="group-title">{{ group.title }}</span>
              <div class="group-meta">
                <el-tag size="mini" effect="dark" :type="getSeverityMetaFor(group.severityCode, group.severityLevel).tagType">{{ group.severityCode }}</el-tag>
                <span>{{ group.events.length }} 个</span>
              </div>
            </div>
          </template>
          <el-table v-if="isGroupExpanded(group.key)" :data="group.events" :row-key="getEventRowKey" border stripe size="small" :row-class-name="getEventRowClassName">
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
                <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'ACKNOWLEDGED')" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
                <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'PROCESSING')" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
                <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'CLOSED')" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
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
        <el-table-column label="风险类型" min-width="220">
          <template slot-scope="{ row }">{{ getDisplayRiskType(row) }}</template>
        </el-table-column>
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
            <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'ACKNOWLEDGED')" @click="updateStatus(row, 'ACKNOWLEDGED')">确认</el-button>
            <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'PROCESSING')" @click="updateStatus(row, 'PROCESSING')">处理中</el-button>
            <el-button v-if="allowStatusUpdate" size="mini" type="text" :disabled="isStatusActionDisabled(row, 'CLOSED')" @click="updateStatus(row, 'CLOSED')">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog
      :visible.sync="riskTreeVisible"
      width="880px"
      title="风险树"
      append-to-body>
      <div class="risk-tree-caption">
        这里展示的是当前 PTD v4.1 在线因果版的主决策路径。页面已经和后端一起升级到“先分流设备/井漏，再升级 kick”，所以看树时可以回到对应曲线逐项核对。
      </div>

      <div class="risk-flow">
        <div v-for="(step, index) in riskDecisionFlow" :key="step.title" class="risk-flow-step">
          <div class="risk-flow-step-title">{{ step.title }}</div>
          <div class="risk-flow-step-desc">{{ step.desc }}</div>
          <div v-if="index < riskDecisionFlow.length - 1" class="risk-flow-arrow">↓</div>
        </div>
      </div>

      <div class="risk-tree-grid">
        <div v-for="branch in riskTreeBranches" :key="branch.key || branch.level" class="risk-tree-branch">
          <div class="risk-tree-branch-head">
            <el-tag size="small" effect="dark" :type="branch.tagType">{{ branch.level }}</el-tag>
            <span>{{ branch.title }}</span>
          </div>
          <div class="risk-tree-branch-code">{{ branch.code }}</div>
          <div class="risk-tree-branch-trigger">{{ branch.trigger }}</div>
          <ul class="risk-tree-branch-list">
            <li v-for="rule in branch.rules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="detailVisible" width="1080px" :title="selectedEventView ? `事件详情 - ${getDisplayRiskType(selectedEventView)}` : '事件详情'" @opened="handleDetailDialogOpened" @closed="handleLocateDialogClosed">
      <template v-if="selectedEventView">
        <div class="summary-meta dialog-meta">
          <el-tag size="small" effect="dark" :type="getSeverityMetaFor(selectedEventView.severity, selectedEventView.severityLevel).tagType">{{ selectedEventView.severity }}</el-tag>
          <el-tag v-if="showEventStatusColumn" size="small" effect="plain" :type="getStatusMetaFor(selectedEventView.status).type">{{ getStatusMetaFor(selectedEventView.status).label }}</el-tag>
          <span>{{ selectedEventView.startTimeLabel }}</span>
          <span>{{ selectedEventView.endTimeLabel }}</span>
          <span>{{ formatDuration(selectedEventView.durationSec) }}</span>
          <span v-if="selectedEventView.configVersion">配置 {{ selectedEventView.configVersion }}</span>
        </div>
        <div class="detail-risk-banner">
          <el-tag size="mini" effect="plain" :type="selectedRiskTypeMeta.tagType">{{ selectedRiskTypeMeta.family }}</el-tag>
          <span>{{ selectedRiskTypeMeta.summary }}</span>
        </div>
        <div v-if="showDetailActionRow" class="action-row dialog-actions compact-actions">
          <el-button v-if="showEventLocateAction" size="mini" type="primary" plain @click="jumpToEvent(selectedEventView)">定位区间</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="warning" plain :disabled="isStatusActionDisabled(selectedEventView, 'ACKNOWLEDGED')" @click="updateStatus(selectedEventView, 'ACKNOWLEDGED')">确认</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="info" plain :disabled="isStatusActionDisabled(selectedEventView, 'PROCESSING')" @click="updateStatus(selectedEventView, 'PROCESSING')">处理中</el-button>
          <el-button v-if="allowStatusUpdate" size="mini" type="success" plain :disabled="isStatusActionDisabled(selectedEventView, 'CLOSED')" @click="updateStatus(selectedEventView, 'CLOSED')">关闭</el-button>
        </div>
        <el-skeleton v-if="detailLoading" :rows="4" animated />
        <template v-else>
          <div v-if="detailSnapshot.timestampLabel !== '-'" class="detail-section">
            <el-collapse v-model="detailExpandedSections" class="detail-collapse">
              <el-collapse-item name="snapshot">
                <template slot="title">
                  <div class="detail-collapse-title">
                    <span>事件快照</span>
                    <span class="detail-collapse-hint">默认折叠</span>
                  </div>
                </template>
                <div class="summary-meta">
                  <span>时间 {{ detailSnapshot.timestampLabel }}</span>
                  <span>工况 {{ getActivityBucketDisplay(detailSnapshot) }}</span>
                  <span>井深 {{ formatDepthValue(detailSnapshot.depth) }}</span>
                  <span>钻头深度 {{ formatDepthValue(detailSnapshot.bitDepth) }}</span>
                  <span v-if="showFormationInfo">层位 {{ detailSnapshot.formationName || '-' }}</span>
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
                  <el-table-column label="PRCD" width="110" align="center">
                    <template slot-scope="{ row }">{{ formatNumber(row.prcdValue, 3) }}</template>
                  </el-table-column>
                  <el-table-column label="PRCD阈值" width="120" align="center">
                    <template slot-scope="{ row }">{{ formatNumber(row.prcdUpperThreshold, 3) }}</template>
                  </el-table-column>
                  <el-table-column label="自适应窗(s)" width="120" align="center">
                    <template slot-scope="{ row }">{{ formatNumber(row.adaptiveWindowSeconds, 0) }}</template>
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
                  <el-table-column label="PRCD异常" width="100" align="center">
                    <template slot-scope="{ row }">
                      <el-tag size="mini" :type="row.isPrcdAnomaly ? 'warning' : 'info'">{{ row.isPrcdAnomaly ? '是' : '否' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="note" label="说明" min-width="220" />
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div class="detail-section">
            <div class="detail-section-head">
              <div class="summary-label">相关曲线</div>
              <div class="summary-meta detail-chart-meta">
                <span v-if="detailChartSourceLabel">{{ detailChartSourceLabel }}</span>
                <span v-if="detailChartWindowLabel">{{ detailChartWindowLabel }}</span>
              </div>
            </div>
            <el-alert v-if="detailChartError" type="warning" :closable="false" show-icon :title="detailChartError" />
            <div v-else-if="detailChartLayouts.length && (detailChartFrames.length || detailChartLoading)" class="detail-chart-grid">
              <el-card
                v-for="layout in detailChartLayouts"
                :key="`detail-${layout.key}`"
                shadow="never"
                class="detail-chart-card"
                :body-style="{ padding: '0' }">
                <div class="detail-chart-card-head">{{ layout.title }}</div>
                <div :ref="`detailChart_${layout.key}`" class="detail-chart-canvas"></div>
              </el-card>
            </div>
            <div v-else class="detail-chart-empty">当前事件暂无可展示的关联曲线。</div>
          </div>

          <div class="detail-section">
            <div class="summary-label">触发证据</div>
            <el-table :data="selectedEventView.evidence || []" border size="small" class="detail-table">
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
import { getUnifiedPtdEventChartApi, getUnifiedPtdEventDetailApi, updateUnifiedPtdEventStatusApi } from '@/api/index';
import { canTransitionPtdStatus, formatDateTime, formatDuration, formatNumber, getActivityBucketLabel, getRiskTypeMeta, getSeverityMeta, getStatusMeta, normalizeEventChartResponse, normalizeEventDetailResponse } from '@/utils/ptdRisk';

const CHART_HEADER_TOP = 16;
const CHART_HEADER_HEIGHT = 22;
const CHART_GRID_TOP = 84;

const CHART_LAYOUTS = [
  { key: 'overview', ref: 'chartOverview', title: '风险等级曲线', type: 'overview', height: 280 },
  { key: 'standpipePress', ref: 'chartSpp', title: '立管压力 SPPA', type: 'metric', metricKey: 'standpipePress', color: '#0f766e', height: 400, groupTitle: '循环与流量链路', groupDesc: '把立压、泵冲、入口、出口、池体积和流量差放在一段连续阅读，先看压力和循环是否失衡，再看放大证据。' },
  { key: 'pumpFlowIn', ref: 'chartPumpFlowIn', title: '泵冲 + 入口流量', type: 'composite', height: 400, seriesDefs: [{ metricKey: 'pumpSpmTotal', name: '总泵冲 SPM', color: '#0284c7', axisName: 'spm', position: 'left' }, { metricKey: 'flowIn', name: '入口流量 MFIA', color: '#16a34a', axisName: 'L/s', position: 'right' }] },
  { key: 'outletFlow', ref: 'chartFlow', title: '出口流量 MFOA', type: 'metric', metricKey: 'outletFlow', color: '#2563eb', height: 400 },
  { key: 'poolVolume', ref: 'chartVolume', title: '总池体积 TVOLACT', type: 'metric', metricKey: 'poolVolume', color: '#7c3aed', height: 400 },
  { key: 'pitFlow', ref: 'chartPitFlow', title: '总池体积变化 + 流量差', type: 'composite', height: 400, seriesDefs: [{ metricKey: 'pitGain', name: '池增量 ΔTVOLACT', color: '#0f766e', axisName: 'm³', position: 'left' }, { metricKey: 'flowBalance', name: '流量差 ΔFlow', color: '#2563eb', axisName: 'L/s', position: 'right' }, { metricKey: 'flowBalanceIntegral', name: '流量差积分 ΔFlow_int', color: '#dc2626', axisName: 'L', position: 'right', offset: 88 }] },
  { key: 'gasChoke', ref: 'chartGasChoke', title: '全烃 + 套压', type: 'composite', height: 400, groupTitle: '气侵与井口反馈', groupDesc: '当前面的循环链路开始偏离时，再用气测和套压确认异常是否正在向井口放大。', seriesDefs: [{ metricKey: 'gas', name: '全烃 GASA', color: '#ca8a04', axisName: '%', position: 'left' }, { metricKey: 'chokePressure', name: '套压 CHKP', color: '#7c2d12', axisName: 'MPa', position: 'right' }] },
  { key: 'hookLoad', ref: 'chartHook', title: '钩载 HKLA', type: 'metric', metricKey: 'hookLoad', color: '#ea580c', height: 400, groupTitle: '机械与钻进干扰', groupDesc: '这组曲线主要用于区分机械扰动和真实井控异常，避免把工况变化误判成溢流。' },
  { key: 'torque', ref: 'chartTorque', title: '扭矩 TORQA', type: 'metric', metricKey: 'torque', color: '#be123c', height: 400 },
  { key: 'rop', ref: 'chartRop', title: '钻时 ROPA', type: 'metric', metricKey: 'rop', color: '#475569', height: 400 },
];

const RISK_DECISION_FLOW = [
  { title: '第 1 步：在线因果预处理', desc: '先走 v4.1 在线因果链路，只使用当前及历史样本完成去异常、去趋势、PTD 与 PRCD 计算，避免历史回放和实时监测语义不一致。' },
  { title: '第 2 步：门控与单参前兆', desc: 'gap reset、恒泵稳定、工况切换软衰减先做门控；门控通过后，PTD 绝对偏离或 PRCD 速率偏离都可以进入 L1 先导预警。' },
  { title: '第 3 步：先分流设备与井漏', desc: '钻具刺漏、钻头水眼掉落、憋螺杆和井漏会先从正向流入链路分流，前端按设备/漏失事件展示，并封顶在 L1。' },
  { title: '第 4 步：只让正向流入协同升级', desc: '只有“流量 + 压力”“流量 + 池增量”“流量加速 + 立压减速”“气测加速 + 流量加速”这类正向协同，才允许升级到 L2。' },
  { title: '第 5 步：IADC 确认', desc: '最终只有池增量、流量差积分与停泵回流等确认链持续成立，才会提升到 L3。' }
];

const RISK_TREE_BRANCHES = [
  {
    key: 'l0',
    level: 'L0',
    title: '不报警 / 保持观察',
    tagType: 'info',
    code: 'gate closed / duration not enough / causal baseline holds',
    trigger: '门控未开、持续时间不足，或当前偏离尚不足以穿透因果阈值。',
    rules: [
      '处于 gap reset、恒泵门控未开启，或仍在工况切换软衰减窗口内。',
      '当前只有短脉冲或尖峰，已被 v4.1 的因果 PRCD 抑制，不直接放大成异常。',
      '协同关系不成立，页面继续保持观察而不会强行升级。'
    ]
  },
  {
    key: 'l1-kick',
    level: 'L1',
    title: '先导预警',
    tagType: 'warning',
    code: 'singleCandidate / PRCD precursor / transition drop',
    trigger: '单参 PTD、PRCD 前兆、地面操作兜底或切换期立压骤降，持续超过 L1MinDurationSec。',
    rules: [
      '出口流量、立压、池量、全烃、套压或机械参数出现持续偏离，会先进入 L1 观察。',
      '全烃和出口流量的 PRCD 速率偏离能先于绝对值穿阈亮起，用来识别 5 到 15 分钟的前兆窗口。',
      '只见池量抬升但缺少正向流入协同，会以“疑似地面操作/加泥”先报 L1。',
      '切换期立压骤降会作为穿透软衰减的前置信号保留。'
    ]
  },
  {
    key: 'l1-fault',
    level: 'L1',
    title: '设备/井漏分流',
    tagType: 'info',
    code: 'fault or loss branch first',
    trigger: '命中设备故障或井漏特征时，系统先分流为 L1 故障/漏失事件，不参与 kick 升级。',
    rules: [
      '钻具刺漏：立压下降 + 出口流量下降，但池量、气测、套压没有正向协同。',
      '钻头水眼掉落：立压骤降 + 流量跃升，但缺少池增、气测和套压协同。',
      '憋螺杆：滑动钻进中立压抬升、扭矩抬升、钻时下降。',
      '井漏：出口流量和池量同步下降，前端按漏失链路展示并封顶 L1。'
    ]
  },
  {
    key: 'l2',
    level: 'L2',
    title: '协同预警',
    tagType: 'danger',
    code: 'positive influx multiCandidate',
    trigger: '只有正向流入协同候选成立，并持续超过 L2MinDurationSec，才允许进入 L2。',
    rules: [
      '出口流量升高 + 立压下降。',
      '出口流量升高 + 池增量持续。',
      '流量加速 + 立压减速，用来识别气侵早期窗口。',
      '气测与流量同步加速，弥补绝对值尚未越阈的前兆场景。',
      '流量差积分持续为正 + 全烃或套压协同抬升。'
    ]
  },
  {
    key: 'l3',
    level: 'L3',
    title: '确认预警',
    tagType: 'danger',
    code: 'confirmCandidate + (pumpOffBackflow or persistent imbalance)',
    trigger: 'confirmCandidate 成立，且出现停泵仍回流，或确认态与失衡态都持续超过 L3MinDurationSec。',
    rules: [
      '恒泵段内，池增量和流量差积分同向持续为正，是 IADC 确认溢流主链路。',
      '停泵后仍检测到明显回流，会直接作为强确认信号拉升到 L3。',
      '事件段内只会升级覆盖，不会因后续较低级帧反向降级。'
    ]
  }
];

function metricSeriesState() {
  return { raw: [], baseline: [], ptd: [], upper: [], lower: [], anomalies: [], prcdAnomalies: [] };
}

function valid(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

const DETAIL_CHART_PADDING_MS = 2 * 60 * 1000;
const DETAIL_CHART_MAX_COUNT = 4;
const FOCUS_AUTO_CLOSE_L1_MS = 60 * 1000;
const FOCUS_AUTO_CLOSE_L2_MS = 2 * 60 * 1000;
const EVENT_CHART_LAYOUT_MAP = CHART_LAYOUTS.reduce((acc, layout) => {
  if (layout.key !== 'overview') {
    acc[layout.key] = { ...layout, height: 280 };
  }
  return acc;
}, {});

function buildDashboardDataset(frames) {
  const metrics = {
    standpipePress: metricSeriesState(),
    outletFlow: metricSeriesState(),
    poolVolume: metricSeriesState(),
    hookLoad: metricSeriesState(),
    torque: metricSeriesState(),
    rop: metricSeriesState(),
    pitGain: metricSeriesState(),
    flowBalance: metricSeriesState(),
    flowBalanceIntegral: metricSeriesState(),
    pumpSpmTotal: metricSeriesState(),
    flowIn: metricSeriesState(),
    gas: metricSeriesState(),
    chokePressure: metricSeriesState()
  };
  const severity = [];
  const newEvents = [];
  const frameMap = {};

  (frames || []).forEach((frame) => {
    if (frame.timestampMs === null) return;
    const timePoint = frame.timestampMs;
    frameMap[timePoint] = frame;
    severity.push([timePoint, frame.severityLevel]);
    if (frame.isNewEvent && frame.severityLevel > 0) {
      newEvents.push([timePoint, frame.severityLevel]);
    }
    Object.keys(metrics).forEach((metricKey) => {
      const metric = frame.metrics[metricKey];
      metrics[metricKey].raw.push([timePoint, metric.originalValue]);
      metrics[metricKey].baseline.push([timePoint, metric.baseline]);
      metrics[metricKey].ptd.push([timePoint, metric.ptdValue]);
      metrics[metricKey].upper.push([timePoint, metric.upperThreshold]);
      metrics[metricKey].lower.push([timePoint, metric.lowerThreshold]);
      metrics[metricKey].anomalies.push(metric.isAnomaly ? [timePoint, metric.originalValue] : [timePoint, null]);
      metrics[metricKey].prcdAnomalies.push(metric.isPrcdAnomaly ? [timePoint, metric.originalValue] : [timePoint, null]);
    });
  });

  return { metrics, severity, newEvents, frameMap };
}

export default {
  name: 'PtdRiskDashboard',
  props: {
    frames: { type: Array, default: () => [] },
    events: { type: Array, default: () => [] },
    sampling: { type: Object, default: () => ({}) },
    configVersion: { type: String, default: '' },
    configVersionId: { type: String, default: '' },
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
    hideHighlightWhenNormal: { type: Boolean, default: false },
    showFormationInfo: { type: Boolean, default: true }
  },
  data() {
    return {
      chartLayouts: CHART_LAYOUTS,
      riskDecisionFlow: RISK_DECISION_FLOW,
      riskTreeBranches: RISK_TREE_BRANCHES,
      chartInstances: {},
      detailChartInstances: {},
      eventOverviewVisible: false,
      riskTreeVisible: false,
      detailVisible: false,
      detailLoading: false,
      detailChartLoading: false,
      detailChartError: '',
      detailChartSource: '',
      detailChartFrames: [],
      detailChartRange: null,
      detailExpandedSections: [],
      selectedEventId: '',
      selectedEventDetail: null,
      selectedEventActionLogs: [],
      resizeObserver: null,
      zoomRange: null,
      manualZoomLocked: false,
      syncingZoom: false,
      expandedGroupNames: [],
      renderTimer: null,
      axisRefreshTimer: null,
      zoomCaptureRaf: null,
      pendingZoomRange: null,
      highlightRange: null,
      highlightTimer: null,
      focusEventId: '',
      dismissedHighlightEvents: {},
      operatedHighlightEvents: {},
      focusAutoCloseTimer: null,
      focusAutoCloseToken: '',
      locateTimer: null,
      locateFinishTimer: null,
      pendingLocateEvent: null,
      pendingLocateDialogCloseCount: 0,
      isLocating: false,
      locateLoadingText: '正在定位到风险曲线，请稍候...',
      statusLoadingMap: {},
      detailRequestToken: 0,
      detailChartRequestToken: 0
    };
  },
  computed: {
    hasData() { return this.frames && this.frames.length > 0; },
    pageModeLabel() { return this.pageMode === 'realtime' ? '实时统一风险判定' : '历史统一风险复盘'; },
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
        const severityMeta = getSeverityMeta(item.severity, item.severityLevel);
        const title = this.getDisplayRiskType(item) || '未分类';
        const key = `${severityMeta.code}::${title}`;
        if (!groups[key]) {
          groups[key] = {
            key,
            title,
            severityCode: severityMeta.code,
            severityLevel: severityMeta.level,
            events: []
          };
        }
        groups[key].events.push(item);
      });
      return Object.values(groups)
        .map((group) => {
          const events = group.events.slice().sort((a, b) => (a.startTimeMs || 0) - (b.startTimeMs || 0) || (b.severityLevel || 0) - (a.severityLevel || 0));
          const latestStartTime = events.reduce((max, item) => Math.max(max, item.startTimeMs || 0), 0);
          return {
            key: group.key,
            title: group.title,
            events,
            severityLevel: group.severityLevel,
            severityCode: group.severityCode,
            latestStartTime
          };
        })
        .sort((a, b) => b.severityLevel - a.severityLevel || b.latestStartTime - a.latestStartTime || a.title.localeCompare(b.title, 'zh-Hans-CN'));
    },
    activeEvents() { return this.sortedEvents.filter(item => item.isActive); },
    focusCandidateEvents() {
      return this.sortedEvents.filter(item => (item.severityLevel || 0) > 0 && !this.isHighlightDismissed(item));
    },
    realtimeFocusEvent() {
      if (this.pageMode !== 'realtime') return null;
      if (this.focusEventId) {
        const focused = this.focusCandidateEvents.find(item => item.eventId === this.focusEventId);
        if (focused) {
          return focused;
        }
      }
      return this.focusCandidateEvents.slice().sort((a, b) => this.compareFocusPriority(a, b))[0] || null;
    },
    highlightEvent() {
      if (this.pageMode === 'realtime') {
        return this.realtimeFocusEvent;
      }
      if (this.selectedEventId) {
        const selected = this.sortedEvents.find(item => item.eventId === this.selectedEventId);
        if (selected) return selected;
      }
      if (this.activeEvents.length) return this.activeEvents[0];
      return this.sortedEvents.find(item => item.severityLevel > 0) || null;
    },
    highlightSeverityMeta() { return this.highlightEvent ? getSeverityMeta(this.highlightEvent.severity, this.highlightEvent.severityLevel) : this.latestSeverityMeta; },
    highlightRiskTypeMeta() {
      return this.highlightEvent ? this.resolveRiskTypeMeta(this.highlightEvent) : { label: '正常', family: '观察', tagType: 'info', summary: '暂无可展示的风险事件。' };
    },
    highlightReasonNodes() {
      return this.buildHighlightReasonNodes(this.highlightEvent);
    },
    highlightAutoCloseHint() {
      if (!this.highlightEvent || this.pageMode !== 'realtime' || this.highlightEvent.isActive || this.isHighlightOperated(this.highlightEvent)) {
        return '';
      }
      const delayMinutes = this.resolveFocusAutoCloseDelay(this.highlightEvent) / 60000;
      return `${this.highlightEvent.severity} 事件结束后 ${delayMinutes} 分钟未操作将自动关闭`;
    },
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
      selectedRiskTypeMeta() {
        return this.selectedEventView ? this.resolveRiskTypeMeta(this.selectedEventView) : { label: '正常', family: '观察', tagType: 'info', summary: '暂无可展示的风险事件。' };
      },
      expandedGroupLookup() {
        if (!this.groupEvents) return {};
        const groupKeys = Array.isArray(this.expandedGroupNames)
          ? this.expandedGroupNames
          : [this.expandedGroupNames].filter(Boolean);
        return groupKeys.reduce((acc, key) => {
          acc[key] = true;
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
        bitDepth: null,
        formationName: '',
        metrics: {}
      }, snapshot || {});
    },
    detailMetricRows() {
      const metrics = this.detailSnapshot.metrics || {};
      return Object.keys(metrics)
        .map(key => metrics[key])
        .filter(item => item && item.label);
    },
    detailChartDataset() {
      return buildDashboardDataset(this.detailChartFrames);
    },
    detailChartLayouts() {
      return this.resolveDetailChartLayouts(this.selectedEventView);
    },
    detailChartVisibleRange() {
      if (!this.detailChartFrames.length) {
        return null;
      }
      const first = this.detailChartFrames[0].timestampMs;
      const last = this.detailChartFrames[this.detailChartFrames.length - 1].timestampMs;
      if (!this.detailChartRange) {
        return { startValue: first, endValue: last };
      }
      return {
        startValue: Math.max(first, this.detailChartRange.startValue),
        endValue: Math.min(last, this.detailChartRange.endValue)
      };
    },
    detailChartTimeSpanMs() {
      const range = this.detailChartVisibleRange;
      return range ? Math.max(0, range.endValue - range.startValue) : 0;
    },
    detailChartSourceLabel() {
      switch (this.detailChartSource) {
        case 'history-local':
          return '来源: 历史页本地数据';
        case 'realtime-local':
          return '来源: 实时页 1h 本地数据';
        case 'remote':
          return '来源: 后端补拉重算';
        default:
          return '';
      }
    },
    detailChartWindowLabel() {
      const range = this.detailChartVisibleRange;
      if (!range) {
        return '';
      }
      return `${formatDateTime(new Date(range.startValue))} ~ ${formatDateTime(new Date(range.endValue))}`;
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
      return buildDashboardDataset(this.frames);
    }
  },
    watch: {
    datasetKey() {
      this.ensureFocusEvent();
      this.ensureSelectedEvent();
      this.ensureZoomRange();
      this.ensureExpandedGroups();
      this.syncFocusAutoClose();
      this.syncDetailChartFromLocal();
      this.scheduleRender();
    },
    selectedEventView() {
      if (this.detailVisible) {
        this.scheduleDetailChartRender();
      }
    },
    detailVisible(value) {
      if (!value) {
        this.detailRequestToken += 1;
        this.detailChartRequestToken += 1;
        this.detailLoading = false;
        this.detailChartLoading = false;
        this.detailChartError = '';
        this.detailChartSource = '';
        this.detailChartFrames = [];
        this.detailChartRange = null;
        this.detailExpandedSections = [];
        this.selectedEventDetail = null;
        this.selectedEventActionLogs = [];
        this.disposeDetailCharts();
      }
    }
  },
  mounted() {
    this.ensureFocusEvent();
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
    if (this.focusAutoCloseTimer) clearTimeout(this.focusAutoCloseTimer);
    if (this.locateTimer) clearTimeout(this.locateTimer);
    if (this.locateFinishTimer) clearTimeout(this.locateFinishTimer);
    this.disposeDetailCharts();
    this.disposeCharts();
  },
  methods: {
    formatNumber,
    formatDuration,
    getSeverityMetaFor(severity, level) { return getSeverityMeta(severity, level); },
    getStatusMetaFor(status) { return getStatusMeta(status); },
    getEventRowKey(row) { return row.eventId || row.recordId || `${row.startTimeMs || 0}-${row.riskType || ''}`; },
    resolveRiskTypeMeta(item) {
      if (!item) {
        return { label: '正常', family: '观察', tagType: 'info', summary: '暂无可展示的风险事件。' };
      }
      return getRiskTypeMeta(item.riskType, item.evidence || []);
    },
    getActivityBucketDisplay(item) {
      if (!item) return '-';
      return getActivityBucketLabel(item.activityBucket, item.activityCode);
    },
    getDisplayRiskType(item) {
      return this.resolveRiskTypeMeta(item).label;
    },
    isHighlightDismissed(eventItem) {
      return Boolean(eventItem && eventItem.eventId && this.dismissedHighlightEvents[eventItem.eventId]);
    },
    isHighlightOperated(eventItem) {
      if (!eventItem || !eventItem.eventId) {
        return false;
      }
      const status = String(eventItem.status || 'NEW').toUpperCase();
      if (status !== 'NEW' && status !== 'TIMEOUT') {
        return true;
      }
      return Boolean(this.operatedHighlightEvents[eventItem.eventId]);
    },
    markHighlightOperated(eventItem) {
      if (!eventItem || !eventItem.eventId) {
        return;
      }
      this.$set(this.operatedHighlightEvents, eventItem.eventId, true);
      this.clearFocusAutoCloseTimer();
    },
    compareFocusPriority(first, second) {
      return (second.severityLevel || 0) - (first.severityLevel || 0)
        || Number(Boolean(second.isActive)) - Number(Boolean(first.isActive))
        || (second.endTimeMs || second.startTimeMs || 0) - (first.endTimeMs || first.startTimeMs || 0)
        || (second.startTimeMs || 0) - (first.startTimeMs || 0);
    },
    shouldReplaceFocusEvent(currentEvent, nextEvent) {
      if (!currentEvent) return true;
      if (!nextEvent) return false;
      const currentSeverity = currentEvent.severityLevel || 0;
      const nextSeverity = nextEvent.severityLevel || 0;
      if (nextSeverity > currentSeverity) return true;
      if (nextSeverity < currentSeverity) return false;
      if (currentEvent.isActive && !nextEvent.isActive) return false;
      if (!currentEvent.isActive && nextEvent.isActive) return true;
      if (String(currentEvent.status || '').toUpperCase() === 'CLOSED'
        && String(nextEvent.status || '').toUpperCase() !== 'CLOSED') {
        return true;
      }
      return (nextEvent.endTimeMs || nextEvent.startTimeMs || 0) > (currentEvent.endTimeMs || currentEvent.startTimeMs || 0);
    },
    ensureFocusEvent() {
      if (this.pageMode !== 'realtime') {
        this.focusEventId = '';
        return;
      }

      const candidates = this.focusCandidateEvents.slice().sort((a, b) => this.compareFocusPriority(a, b));
      const current = this.focusEventId
        ? this.sortedEvents.find(item => item.eventId === this.focusEventId)
        : null;
      const next = candidates[0] || null;

      if (!current) {
        this.focusEventId = next ? next.eventId : '';
        return;
      }

      if (!next) {
        this.focusEventId = '';
        return;
      }

      if (next.eventId === current.eventId) {
        return;
      }

      if (this.shouldReplaceFocusEvent(current, next)) {
        this.focusEventId = next.eventId;
      }
    },
    dismissHighlightCard(eventItem) {
      if (!eventItem || !eventItem.eventId) {
        return;
      }
      this.$set(this.dismissedHighlightEvents, eventItem.eventId, true);
      if (this.focusEventId === eventItem.eventId) {
        this.focusEventId = '';
      }
      this.clearFocusAutoCloseTimer();
      this.ensureFocusEvent();
      this.ensureSelectedEvent();
    },
    clearFocusAutoCloseTimer() {
      if (this.focusAutoCloseTimer) {
        clearTimeout(this.focusAutoCloseTimer);
        this.focusAutoCloseTimer = null;
      }
      this.focusAutoCloseToken = '';
    },
    resolveFocusAutoCloseDelay(eventItem) {
      return (eventItem && (eventItem.severityLevel || 0) <= 1)
        ? FOCUS_AUTO_CLOSE_L1_MS
        : FOCUS_AUTO_CLOSE_L2_MS;
    },
    syncFocusAutoClose() {
      if (this.pageMode !== 'realtime' || !this.highlightEvent || this.highlightEvent.isActive || this.isHighlightOperated(this.highlightEvent)) {
        this.clearFocusAutoCloseTimer();
        return;
      }

      const token = [
        this.highlightEvent.eventId,
        this.highlightEvent.endTimeMs || 0,
        this.highlightEvent.status || 'NEW',
        this.highlightEvent.isActive ? '1' : '0'
      ].join('|');
      if (this.focusAutoCloseToken === token && this.focusAutoCloseTimer) {
        return;
      }

      const targetEventId = this.highlightEvent.eventId;
      const delay = this.resolveFocusAutoCloseDelay(this.highlightEvent);
      this.clearFocusAutoCloseTimer();
      this.focusAutoCloseToken = token;
      this.focusAutoCloseTimer = setTimeout(() => {
        this.focusAutoCloseTimer = null;
        this.focusAutoCloseToken = '';
        const current = this.highlightEvent;
        if (current && current.eventId === targetEventId && !current.isActive && !this.isHighlightOperated(current)) {
          this.dismissHighlightCard(current);
        }
      }, delay);
    },
    formatEvidenceSummary(item) {
      if (!item) {
        return '暂无主证据';
      }
      const direction = this.directionText(item.direction);
      const ratio = valid(item.ratio) ? `，倍数 ${this.formatAxisValue(item.ratio)}` : '';
      return `${item.label || item.code || '证据项'} ${direction}${ratio}`;
    },
    buildHighlightReasonNodes(eventItem) {
      if (!eventItem) {
        return [];
      }
      const riskMeta = this.resolveRiskTypeMeta(eventItem);
      const nodes = [];
      nodes.push({
        key: 'activity',
        label: '工况入口',
        text: `${this.getActivityBucketDisplay(eventItem.snapshot || eventItem)}，开始于 ${eventItem.startTimeLabel}`
      });
      (eventItem.evidence || []).slice(0, 2).forEach((item, index) => {
        nodes.push({
          key: `evidence-${index}`,
          label: `主证据 ${index + 1}`,
          text: this.formatEvidenceSummary(item)
        });
      });
      nodes.push({
        key: 'decision',
        label: '判定输出',
        text: `${eventItem.severity} ${riskMeta.family}，${riskMeta.summary}`
      });
      return nodes;
    },
    pushDetailChartLayoutKey(layoutKeys, layoutKey) {
      if (!layoutKey || !EVENT_CHART_LAYOUT_MAP[layoutKey] || layoutKeys.includes(layoutKey)) {
        return;
      }
      layoutKeys.push(layoutKey);
    },
    resolveDetailChartLayouts(eventItem) {
      if (!eventItem) {
        return [];
      }

      const layoutKeys = [];
      const riskType = this.getDisplayRiskType(eventItem);
      const evidenceCodes = new Set((eventItem.evidence || []).map(item => item.code));

      if (riskType.includes('气侵') || evidenceCodes.has('gas_high') || evidenceCodes.has('gas_accel') || evidenceCodes.has('choke_high')) {
        this.pushDetailChartLayoutKey(layoutKeys, 'gasChoke');
      }
      if (riskType.includes('井漏') || riskType.includes('池增量') || evidenceCodes.has('pool_high') || evidenceCodes.has('pool_low') || evidenceCodes.has('pit_gain') || evidenceCodes.has('loss_circulation_pattern')) {
        this.pushDetailChartLayoutKey(layoutKeys, 'pitFlow');
        this.pushDetailChartLayoutKey(layoutKeys, 'poolVolume');
      }
      if (riskType.includes('刺漏') || riskType.includes('水眼掉落') || evidenceCodes.has('spp_low') || evidenceCodes.has('spp_decel') || evidenceCodes.has('spp_transition_drop')) {
        this.pushDetailChartLayoutKey(layoutKeys, 'standpipePress');
      }
      if (riskType.includes('流量') || riskType.includes('回流') || evidenceCodes.has('flow_high') || evidenceCodes.has('flow_low') || evidenceCodes.has('flow_accel') || evidenceCodes.has('blowoff_precursor')) {
        this.pushDetailChartLayoutKey(layoutKeys, 'outletFlow');
      }
      if (riskType.includes('螺杆') || riskType.includes('机械') || evidenceCodes.has('torque_low') || evidenceCodes.has('hook_high') || evidenceCodes.has('rop_low') || evidenceCodes.has('motor_stall')) {
        this.pushDetailChartLayoutKey(layoutKeys, 'torque');
        this.pushDetailChartLayoutKey(layoutKeys, 'hookLoad');
        this.pushDetailChartLayoutKey(layoutKeys, 'rop');
      }

      this.pushDetailChartLayoutKey(layoutKeys, 'outletFlow');
      this.pushDetailChartLayoutKey(layoutKeys, 'standpipePress');
      this.pushDetailChartLayoutKey(layoutKeys, 'pitFlow');

      return layoutKeys
        .slice(0, DETAIL_CHART_MAX_COUNT)
        .map(key => EVENT_CHART_LAYOUT_MAP[key]);
    },
    buildEventTimeRange(eventItem) {
      if (!eventItem) {
        return null;
      }
      const startValue = eventItem.startTimeMs || (this.latestFrame ? this.latestFrame.timestampMs : 0);
      const endValue = Math.max(startValue + 1000, eventItem.endTimeMs || startValue);
      return { startValue, endValue };
    },
    buildEventChartWindow(eventItem) {
      const eventRange = this.buildEventTimeRange(eventItem);
      if (!eventRange) {
        return null;
      }
      const { startValue, endValue } = eventRange;
      const durationMs = Math.max(1000, endValue - startValue);
      const paddingMs = Math.max(DETAIL_CHART_PADDING_MS, durationMs * 0.35);
      return {
        startValue: Math.max(0, startValue - paddingMs),
        endValue: endValue + paddingMs
      };
    },
    canUseLocalEventChartSource(eventItem, range = this.buildEventChartWindow(eventItem)) {
      if (!range || !this.hasData) {
        return false;
      }
      if (this.pageMode === 'history') {
        return true;
      }
      const eventRange = this.buildEventTimeRange(eventItem);
      if (!eventRange) {
        return false;
      }
      return this.earliestFrame.timestampMs <= eventRange.startValue && this.latestFrame.timestampMs >= eventRange.endValue;
    },
    resolveLocalEventChartRange(eventItem, range = this.buildEventChartWindow(eventItem)) {
      if (!range || !this.hasData) {
        return null;
      }
      if (this.pageMode === 'history') {
        return range;
      }
      const eventRange = this.buildEventTimeRange(eventItem);
      if (!eventRange) {
        return null;
      }
      if (this.earliestFrame.timestampMs > eventRange.startValue || this.latestFrame.timestampMs < eventRange.endValue) {
        return null;
      }
      return {
        startValue: Math.max(this.earliestFrame.timestampMs, range.startValue),
        endValue: Math.min(this.latestFrame.timestampMs, range.endValue)
      };
    },
    extractFramesForRange(range, framesSource = this.frames) {
      if (!range) {
        return [];
      }
      return (framesSource || []).filter(item => item.timestampMs !== null && item.timestampMs >= range.startValue && item.timestampMs <= range.endValue);
    },
    syncDetailChartFromLocal() {
      if (!this.detailVisible || !this.selectedEventView || !this.detailChartRange) {
        return;
      }
      if (!this.canUseLocalEventChartSource(this.selectedEventView, this.detailChartRange)) {
        return;
      }
      const localRange = this.resolveLocalEventChartRange(this.selectedEventView, this.detailChartRange);
      const frames = this.extractFramesForRange(localRange || this.detailChartRange);
      if (!frames.length) {
        return;
      }
      this.detailChartRange = localRange || this.detailChartRange;
      this.detailChartFrames = frames;
      this.detailChartSource = this.pageMode === 'history' ? 'history-local' : 'realtime-local';
      this.scheduleDetailChartRender();
    },
    buildEventChartRequestParams(eventItem, range) {
      if (!range) {
        return null;
      }
      return {
        wellId: this.currentWellId,
        startTime: formatDateTime(new Date(range.startValue)).replace(' ', 'T'),
        endTime: formatDateTime(new Date(range.endValue)).replace(' ', 'T'),
        configVersionId: (eventItem && eventItem.configVersionId) || this.configVersionId || ''
      };
    },
    async loadEventRelatedCharts(eventItem) {
      const requestToken = this.detailChartRequestToken + 1;
      this.detailChartRequestToken = requestToken;
      this.detailChartError = '';
      this.detailChartSource = '';
      this.detailChartFrames = [];
      const requestRange = this.buildEventChartWindow(eventItem);
      this.detailChartRange = requestRange;
      this.disposeDetailCharts();

      if (!eventItem || !requestRange || !this.detailChartLayouts.length) {
        return;
      }

      if (this.canUseLocalEventChartSource(eventItem, requestRange)) {
        const localRange = this.resolveLocalEventChartRange(eventItem, requestRange);
        this.detailChartRange = localRange || requestRange;
        this.detailChartFrames = this.extractFramesForRange(this.detailChartRange);
        this.detailChartSource = this.pageMode === 'history' ? 'history-local' : 'realtime-local';
        this.scheduleDetailChartRender();
        return;
      }

      const params = this.buildEventChartRequestParams(eventItem, requestRange);
      if (!params || !params.wellId) {
        this.detailChartError = '当前井号为空，无法补拉相关曲线';
        return;
      }

      this.detailChartLoading = true;
      this.scheduleDetailChartRender();
      try {
        const response = await getUnifiedPtdEventChartApi(params);
        if (requestToken !== this.detailChartRequestToken) {
          return;
        }
        const normalized = normalizeEventChartResponse(response && response.data ? response.data : response);
        this.detailChartFrames = normalized.frames;
        this.detailChartSource = 'remote';
        if (!this.detailChartFrames.length) {
          this.detailChartError = '当前事件在补拉时间窗内没有可展示的曲线数据';
          return;
        }
        this.scheduleDetailChartRender();
      } catch (error) {
        if (requestToken !== this.detailChartRequestToken) {
          return;
        }
        this.detailChartError = this.resolveRequestErrorMessage(error, '相关曲线加载失败');
      } finally {
        if (requestToken === this.detailChartRequestToken) {
          this.detailChartLoading = false;
          this.scheduleDetailChartRender();
        }
      }
    },
    ensureSelectedEvent() {
      const exists = this.selectedEventId && this.sortedEvents.some(item => item.eventId === this.selectedEventId);
      if (!exists && this.highlightEvent) this.selectedEventId = this.highlightEvent.eventId;
    },
    ensureExpandedGroups() {
      if (!this.groupEvents) return;
      const groupKeys = this.groupedEventGroups.map(item => item.key);
      this.expandedGroupNames = this.expandedGroupNames.filter(item => groupKeys.includes(item));
      if (!this.expandedGroupNames.length) {
        this.expandedGroupNames = this.groupedEventGroups
          .filter(item => item.severityLevel >= 2)
          .map(item => item.key);
      }
    },
    isGroupExpanded(name) {
      return Boolean(this.expandedGroupLookup[name]);
    },
    openEventOverview() {
      if (this.showEventTableInline) return;
      this.eventOverviewVisible = true;
    },
    openRiskTree() {
      this.riskTreeVisible = true;
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
    formatDepthValue(value) {
      const formatted = formatNumber(value, 2);
      return formatted === '-' ? '-' : `${formatted} m`;
    },
    canUpdateStatus(eventItem, nextStatus) {
      if (!eventItem) return false;
      return canTransitionPtdStatus(eventItem.status, nextStatus);
    },
    isStatusActionDisabled(eventItem, nextStatus) {
      if (!eventItem || !eventItem.eventId) return true;
      return this.isStatusBusy(eventItem.eventId) || !this.canUpdateStatus(eventItem, nextStatus);
    },
    resolveRequestErrorMessage(error, fallback) {
      const responseBody = error && error.response ? error.response.data : null;
      const message = responseBody ? (responseBody.msg || responseBody.message) : '';
      return message || fallback;
    },
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
    parseTimestampMs(value) {
      if (value instanceof Date) {
        return value.getTime();
      }
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : NaN;
      }
      if (typeof value === 'string' && value) {
        const normalized = value.includes('T') ? value : value.replace(' ', 'T');
        const parsed = new Date(normalized).getTime();
        return Number.isFinite(parsed) ? parsed : NaN;
      }
      return NaN;
    },
    setTransientHighlightRange(startValue, endValue) {
      const normalized = this.normalizeZoomRange({ startValue, endValue });
      if (!normalized) return;
      this.highlightRange = normalized;
      if (this.highlightTimer) clearTimeout(this.highlightTimer);
      this.refreshHighlightAreas();
      this.highlightTimer = setTimeout(() => {
        this.highlightRange = null;
        this.refreshHighlightAreas();
      }, 2400);
    },
    setTransientHighlight(eventItem) {
      if (!eventItem) return;
      const startValue = eventItem.startTimeMs || (this.latestFrame ? this.latestFrame.timestampMs : 0);
      const endValue = Math.max(startValue + 1000, eventItem.endTimeMs || startValue);
      this.setTransientHighlightRange(startValue, endValue);
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
      const requestToken = this.detailRequestToken + 1;
      this.detailRequestToken = requestToken;
      this.selectedEventId = eventItem.eventId;
      this.selectedEventDetail = null;
      this.selectedEventActionLogs = [];
      this.detailExpandedSections = [];
      this.detailVisible = true;
      this.markHighlightOperated(eventItem);
      this.detailChartLoading = false;
      this.loadEventRelatedCharts(eventItem);
      if (!eventItem.recordId) return;
      this.detailLoading = true;
      try {
        const response = await getUnifiedPtdEventDetailApi({ recordId: eventItem.recordId });
        if (requestToken !== this.detailRequestToken) {
          return;
        }
        const detail = normalizeEventDetailResponse(response && response.data ? response.data : response);
        this.selectedEventDetail = detail.event;
        this.selectedEventActionLogs = detail.actionLogs;
      } catch (error) {
        if (requestToken !== this.detailRequestToken) {
          return;
        }
        this.selectedEventDetail = null;
        this.selectedEventActionLogs = [];
        this.$message.error('事件详情加载失败');
      } finally {
        if (requestToken === this.detailRequestToken) {
          this.detailLoading = false;
        }
      }
    },
    handleDetailDialogOpened() {
      this.scheduleDetailChartRender();
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
    performTimeLocate(targetTimeMs) {
      if (!this.hasData || !Number.isFinite(targetTimeMs)) return false;
      const clampedTimeMs = Math.max(this.earliestFrame.timestampMs, Math.min(this.latestFrame.timestampMs, targetTimeMs));
      const halfWindowMs = Math.max(1, this.defaultWindowMinutes) * 60 * 1000 / 2;
      const nextZoomRange = this.buildCenteredZoomRange(clampedTimeMs, halfWindowMs);
      const highlightStart = Math.max(this.earliestFrame.timestampMs, clampedTimeMs - 30 * 1000);
      const highlightEnd = Math.min(this.latestFrame.timestampMs, clampedTimeMs + 30 * 1000);
      this.manualZoomLocked = true;
      this.setTransientHighlightRange(highlightStart, Math.max(highlightStart + 1000, highlightEnd));
      const zoomChanged = !this.rangesEqual(this.zoomRange, nextZoomRange);
      this.zoomRange = nextZoomRange;
      if (zoomChanged) {
        this.applyZoomRange();
      } else {
        this.scheduleAxisRefresh(true);
      }
      this.scrollChartsIntoView();
      this.finishLocateFeedback(520);
      return true;
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
      this.markHighlightOperated(eventItem);
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
    jumpToTimestamp(targetTimestamp) {
      if (!this.hasData || this.isLocating) return false;
      const targetMs = this.parseTimestampMs(targetTimestamp);
      if (!Number.isFinite(targetMs)) return false;
      if (this.locateTimer) {
        clearTimeout(this.locateTimer);
        this.locateTimer = null;
      }
      this.beginLocateFeedback('正在定位到指定时间点，请稍候...');
      this.$nextTick(() => {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(() => this.performTimeLocate(targetMs));
          return;
        }
        this.performTimeLocate(targetMs);
      });
      return true;
    },
    async updateStatus(eventItem, status) {
      if (!eventItem || !eventItem.eventId || this.isStatusBusy(eventItem.eventId) || !this.canUpdateStatus(eventItem, status)) return;
      const previousStatus = eventItem.status;
      this.markHighlightOperated(eventItem);
      this.$set(this.statusLoadingMap, eventItem.eventId, true);
      this.$emit('status-updated', { eventId: eventItem.eventId, recordId: eventItem.recordId, status });
      try {
        const response = await updateUnifiedPtdEventStatusApi({ recordId: eventItem.recordId, analysisRunId: eventItem.analysisRunId, eventId: eventItem.eventId, status });
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
        this.$message.error(this.resolveRequestErrorMessage(error, '事件状态更新失败'));
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
    scheduleDetailChartRender() {
      this.$nextTick(() => {
        if (!this.detailVisible) {
          this.disposeDetailCharts();
          return;
        }
        if (!this.detailChartLayouts.length) {
          this.disposeDetailCharts();
          return;
        }
        if (this.detailChartLoading) {
          this.syncDetailChartLoadingState();
          return;
        }
        if (!this.detailChartFrames.length) {
          this.disposeDetailCharts();
          return;
        }
        this.renderDetailCharts();
      });
    },
    syncDetailChartLoadingState() {
      if (!this.detailVisible || !this.detailChartLayouts.length) {
        return;
      }
      this.detailChartLayouts.forEach((layout) => {
        const chart = this.getOrCreateDetailChart(layout);
        if (!chart) return;
        if (this.detailChartLoading) {
          chart.showLoading('default', {
            text: '正在加载相关曲线...',
            color: '#2563eb',
            textColor: '#475569',
            maskColor: 'rgba(248, 250, 252, 0.82)'
          });
        } else {
          chart.hideLoading();
        }
      });
    },
    handleResize() {
      Object.keys(this.chartInstances).forEach((key) => {
        if (this.chartInstances[key]) this.chartInstances[key].resize();
      });
      Object.keys(this.detailChartInstances).forEach((key) => {
        if (this.detailChartInstances[key]) this.detailChartInstances[key].resize();
      });
    },
    disposeCharts() {
      Object.keys(this.chartInstances).forEach((key) => {
        if (this.chartInstances[key]) this.chartInstances[key].dispose();
      });
      this.chartInstances = {};
    },
    disposeDetailCharts() {
      Object.keys(this.detailChartInstances).forEach((key) => {
        if (this.detailChartInstances[key]) this.detailChartInstances[key].dispose();
      });
      this.detailChartInstances = {};
    },
    formatAxisTime(value, compact = false, timeSpanMs = this.timeSpanMs) {
      const date = new Date(value);
      const pad = input => String(input).padStart(2, '0');
      const md = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      const hms = `${hm}:${pad(date.getSeconds())}`;
      if (compact) return timeSpanMs <= 2 * 60 * 60 * 1000 ? hms : `${md} ${hm}`;
      return timeSpanMs <= 2 * 60 * 60 * 1000 ? hms : `${md}\n${hm}`;
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
    buildValueAxis(name, color, seriesList, position = 'left', offset = 0, showSplitLine = true, range = undefined) {
      const extent = this.axisExtent(seriesList, range);
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
    buildBaseOption(extra = {}, options = {}) {
      const range = options.range === undefined ? this.resolveVisibleAxisRange() : options.range;
      const timeSpanMs = options.timeSpanMs === undefined ? this.timeSpanMs : options.timeSpanMs;
      const enableZoom = options.enableZoom !== false;
      const lockXAxisRange = options.lockXAxisRange === true || !enableZoom;
      const baseOption = {
        animation: false,
        animationThreshold: 1000,
        hoverLayerThreshold: 2000,
        title: {
          text: '',
          left: 18,
          top: CHART_HEADER_TOP,
          padding: [2, 0, 0, 0],
          textStyle: { fontSize: 14, lineHeight: CHART_HEADER_HEIGHT, color: '#475569', fontWeight: 600, verticalAlign: 'middle' }
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
        tooltip: { trigger: 'axis', axisPointer: { type: 'line', snap: false, animation: false }, confine: true, transitionDuration: 0 },
        dataZoom: enableZoom ? [
          { type: 'inside', filterMode: 'none', throttle: 80, startValue: range ? range.startValue : undefined, endValue: range ? range.endValue : undefined },
          {
            type: 'slider',
            filterMode: 'none',
            realtime: true,
            throttle: 80,
            bottom: 5,
            height: 15,
            startValue: range ? range.startValue : undefined,
            endValue: range ? range.endValue : undefined,
            labelFormatter: value => this.formatAxisTime(value, true, timeSpanMs)
          }
        ] : [],
        xAxis: {
          type: 'time',
          boundaryGap: false,
          min: lockXAxisRange && range ? range.startValue : undefined,
          max: lockXAxisRange && range ? range.endValue : undefined,
          axisLabel: { color: '#475569', fontSize: 11, margin: 10, hideOverlap: true, formatter: value => this.formatAxisTime(value, false, timeSpanMs) },
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
    tooltipFormatter(params, dataset = this.dashboardDataset) {
      if (!params || !params.length) return '';
      const axisValue = params[0].axisValue;
      const frame = dataset.frameMap[axisValue];
      const lines = [formatDateTime(axisValue)];
      if (frame) {
        lines.push(`工况: ${this.getActivityBucketDisplay(frame)}`);
        lines.push(`风险: ${frame.severity} ${this.getDisplayRiskType(frame)}`);
        lines.push(`井深: ${this.formatDepthValue(frame.depth)}`);
        lines.push(`钻头深度: ${this.formatDepthValue(frame.bitDepth)}`);
        if (this.showFormationInfo) {
          lines.push(`层位: ${frame.formationName || '-'}`);
        }
      }
      params.forEach((item) => {
        const value = Array.isArray(item.data) ? item.data[1] : null;
        if (!valid(value)) return;
        lines.push(`${item.marker}${item.seriesName}: ${this.formatAxisValue(value)}`);
      });
      return lines.join('<br/>');
    },
    buildOverviewOption(options = {}) {
      const dataset = options.dataset || this.dashboardDataset;
      const markAreas = options.markAreas === undefined ? this.chartMarkAreas : options.markAreas;
      return this.buildBaseOption({
        title: { text: '风险等级时间轴' },
        tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params, dataset) },
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
          splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
          splitArea: { show: true, areaStyle: { color: ['rgba(148, 163, 184, 0.08)', 'rgba(245, 158, 11, 0.08)', 'rgba(249, 115, 22, 0.08)', 'rgba(220, 38, 38, 0.08)'] } }
        },
        series: [
          this.buildLineSeries({ name: '风险等级', step: 'end', lineStyle: { width: 3, color: '#d97706' }, itemStyle: { color: '#d97706' }, areaStyle: { color: 'rgba(217, 119, 6, 0.18)' }, markArea: { silent: true, data: markAreas }, data: dataset.severity }),
          this.buildScatterSeries({ name: '新事件', symbolSize: 9, itemStyle: { color: '#dc2626' }, data: dataset.newEvents })
        ]
      }, options);
    },
    metricUnit(metricKey, frameSource = this.latestFrame) {
      const metric = frameSource && frameSource.metrics ? frameSource.metrics[metricKey] : null;
      return metric && metric.unit ? metric.unit : '';
    },
    buildMetricOption(layout, options = {}) {
      const dataset = options.dataset || this.dashboardDataset;
      const markAreas = options.markAreas === undefined ? this.chartMarkAreas : options.markAreas;
      const range = options.range === undefined ? this.resolveVisibleAxisRange() : options.range;
      const latestFrame = options.latestFrame === undefined ? this.latestFrame : options.latestFrame;
      const series = dataset.metrics[layout.metricKey];
      const unit = this.metricUnit(layout.metricKey, latestFrame);
      return this.buildBaseOption({
        title: { text: layout.title },
        tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params, dataset) },
        yAxis: [
          this.buildValueAxis(unit ? `原值 (${unit})` : '原值', layout.color, [series.raw, series.baseline, series.anomalies, series.prcdAnomalies], 'left', 0, true, range),
          this.buildValueAxis('PTD / 阈值', '#9333ea', [series.ptd, series.upper, series.lower], 'right', 0, false, range)
        ],
        series: [
          this.buildLineSeries({ name: '原值', yAxisIndex: 0, lineStyle: { width: 2, color: layout.color }, itemStyle: { color: layout.color }, markArea: { silent: true, data: markAreas }, data: series.raw }),
          this.buildLineSeries({ name: '基线', yAxisIndex: 0, lineStyle: { width: 1, type: 'dashed', color: '#64748b' }, itemStyle: { color: '#64748b' }, data: series.baseline }),
          this.buildLineSeries({ name: 'PTD', yAxisIndex: 1, lineStyle: { width: 1.5, color: '#9333ea' }, itemStyle: { color: '#9333ea' }, data: series.ptd }),
          this.buildLineSeries({ name: '上阈', yAxisIndex: 1, lineStyle: { width: 1, type: 'dashed', color: '#dc2626' }, itemStyle: { color: '#dc2626' }, data: series.upper }),
          this.buildLineSeries({ name: '下阈', yAxisIndex: 1, lineStyle: { width: 1, type: 'dashed', color: '#2563eb' }, itemStyle: { color: '#2563eb' }, data: series.lower }),
          this.buildScatterSeries({ name: '异常点', yAxisIndex: 0, symbolSize: 7, itemStyle: { color: '#dc2626' }, data: series.anomalies }),
          this.buildScatterSeries({ name: 'PRCD异常', yAxisIndex: 0, symbolSize: 8, symbol: 'diamond', itemStyle: { color: '#f59e0b' }, data: series.prcdAnomalies })
        ]
      }, options);
    },
    buildCompositeOption(layout, options = {}) {
      const dataset = options.dataset || this.dashboardDataset;
      const markAreas = options.markAreas === undefined ? this.chartMarkAreas : options.markAreas;
      const range = options.range === undefined ? this.resolveVisibleAxisRange() : options.range;
      const yAxis = layout.seriesDefs.map(item => this.buildValueAxis(item.axisName || item.name, item.color, [dataset.metrics[item.metricKey].raw], item.position || 'left', item.offset || 0, item.position !== 'right' || !item.offset, range));
      const series = layout.seriesDefs.map((item, index) => this.buildLineSeries({ name: item.name, yAxisIndex: index, lineStyle: { width: 2, color: item.color }, itemStyle: { color: item.color }, markArea: index === 0 ? { silent: true, data: markAreas } : undefined, data: dataset.metrics[item.metricKey].raw }));
      return this.buildBaseOption({ title: { text: layout.title }, grid: { left: 72, right: layout.seriesDefs.length >= 3 ? 214 : 88, top: CHART_GRID_TOP, bottom: 48 }, tooltip: { trigger: 'axis', formatter: params => this.tooltipFormatter(params, dataset) }, yAxis, series }, options);
    },
    buildChartOption(layout, options = {}) {
      if (layout.type === 'overview') return this.buildOverviewOption(options);
      if (layout.type === 'metric') return this.buildMetricOption(layout, options);
      return this.buildCompositeOption(layout, options);
    },
    buildDetailChartMarkAreas() {
      if (!this.selectedEventView) {
        return [];
      }
      return [[
        {
          xAxis: this.selectedEventView.startTimeMs,
          itemStyle: { color: 'rgba(250, 204, 21, 0.28)' }
        },
        {
          xAxis: Math.max((this.selectedEventView.startTimeMs || 0) + 1000, this.selectedEventView.endTimeMs || this.selectedEventView.startTimeMs || 0)
        }
      ]];
    },
    buildDetailChartOption(layout) {
      const latestFrame = this.detailChartFrames.length ? this.detailChartFrames[this.detailChartFrames.length - 1] : null;
      const option = this.buildChartOption(layout, {
        dataset: this.detailChartDataset,
        latestFrame,
        markAreas: this.buildDetailChartMarkAreas(),
        range: this.detailChartVisibleRange,
        timeSpanMs: this.detailChartTimeSpanMs,
        enableZoom: false
      });
      return {
        ...option,
        title: {
          ...(option.title || {}),
          text: ''
        },
        legend: {
          ...(option.legend || {}),
          show: false
        },
        grid: {
          ...(option.grid || {}),
          top: 62
        }
      };
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
            this.buildValueAxis(unit ? `原值 (${unit})` : '原值', layout.color, [series.raw, series.baseline, series.anomalies, series.prcdAnomalies], 'left', 0, true),
            this.buildValueAxis('PTD / 阈值', '#9333ea', [series.ptd, series.upper, series.lower], 'right', 0, false)
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
      chart.on('dataZoom', params => this.captureZoom(params));
      this.chartInstances[layout.key] = chart;
      return chart;
    },
    getOrCreateDetailChart(layout) {
      if (this.detailChartInstances[layout.key]) return this.detailChartInstances[layout.key];
      const target = this.$refs[`detailChart_${layout.key}`];
      const dom = Array.isArray(target) ? target[0] : target;
      if (!dom) return null;
      const chart = echarts.init(dom, null, { renderer: 'canvas' });
      this.detailChartInstances[layout.key] = chart;
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
      this.applyZoomRange();
      this.handleResize();
    },
    renderDetailCharts() {
      this.detailChartLayouts.forEach((layout) => {
        const chart = this.getOrCreateDetailChart(layout);
        if (!chart) return;
        chart.hideLoading();
        chart.setOption(this.buildDetailChartOption(layout), false, true);
      });
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
.summary-entry-actions { gap: 12px; }
.summary-entry-button { padding: 0; font-size: 12px; }
.subtle-entry-button { color: #64748b; }
.focus-card { padding: 16px 18px 14px; border: 1px solid #dbeafe; background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); }
.focus-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
.focus-main { flex: 1 1 520px; min-width: 0; }
.focus-meta { align-items: center; }
.focus-close-hint { color: #b45309; }
.focus-actions { align-items: flex-start; }
.focus-action-button { padding: 4px 10px !important; }
.focus-tree { margin-top: 14px; padding-top: 14px; border-top: 1px dashed #cbd5e1; }
.focus-tree-root { position: relative; padding-left: 0; }
.focus-tree-node { display: flex; gap: 12px; align-items: flex-start; padding: 10px 12px; border-radius: 10px; background: #eff6ff; border: 1px solid #dbeafe; }
.focus-tree-label { flex: 0 0 54px; font-size: 12px; color: #1d4ed8; font-weight: 600; }
.focus-tree-text { display: flex; flex-direction: column; gap: 4px; color: #334155; line-height: 1.6; }
.focus-tree-text strong { color: #0f172a; }
.focus-tree-branches { position: relative; margin-top: 12px; padding-left: 20px; }
.focus-tree-branches::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 8px; width: 1px; background: #cbd5e1; }
.focus-tree-branch { position: relative; display: flex; gap: 12px; align-items: flex-start; padding: 0 0 12px 12px; }
.focus-tree-branch::before { content: ''; position: absolute; left: -1px; top: 11px; width: 12px; height: 1px; background: #cbd5e1; }
.focus-tree-branch-label { flex: 0 0 54px; font-size: 12px; color: #64748b; font-weight: 600; }
.focus-tree-branch-text { flex: 1; color: #334155; line-height: 1.6; }
.action-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.chart-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; color: #475569; }
.chart-head span:first-child { color: #0f172a; font-weight: 600; }
.chart-group-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 16px; align-items: center; padding: 6px 2px 0; color: #475569; }
.chart-group-title { font-size: 14px; font-weight: 600; color: #0f172a; }
.chart-group-desc { font-size: 12px; color: #64748b; }
.chart-panel { overflow: hidden; }
.chart-canvas { width: 100%; }
.group-title-row, .group-meta { display: flex; align-items: center; gap: 10px; }
.group-title { font-weight: 600; }
.dialog-meta, .dialog-actions { margin-bottom: 12px; }
.dialog-actions { justify-content: flex-start; }
.detail-risk-banner { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: -2px 0 12px; padding: 10px 12px; border-radius: 10px; background: #f8fafc; color: #334155; line-height: 1.7; }
.compact-actions .el-button--mini { padding: 6px 10px; }
.detail-section-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 16px; }
.detail-chart-meta { margin-top: 0; }
.detail-collapse { border-top: none; border-bottom: none; }
.detail-collapse-title { display: flex; gap: 10px; align-items: center; }
.detail-collapse-hint { color: #94a3b8; font-size: 12px; }
.detail-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
.detail-chart-card { border: 1px solid #e2e8f0; }
.detail-chart-card-head { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; }
.detail-chart-canvas { width: 100%; height: 280px; }
.detail-chart-empty { margin-top: 12px; padding: 18px 16px; border: 1px dashed #cbd5e1; border-radius: 10px; color: #64748b; background: #f8fafc; }
.risk-tree-caption { color: #475569; line-height: 1.7; }
.risk-flow { margin-top: 16px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
.risk-flow-step + .risk-flow-step { margin-top: 10px; }
.risk-flow-step-title { font-size: 13px; font-weight: 600; color: #0f172a; }
.risk-flow-step-desc { margin-top: 6px; color: #475569; line-height: 1.7; }
.risk-flow-arrow { margin-top: 10px; color: #94a3b8; text-align: center; }
.risk-tree-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.risk-tree-branch { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
.risk-tree-branch-head { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #0f172a; }
.risk-tree-branch-code { margin-top: 8px; font-size: 12px; color: #64748b; }
.risk-tree-branch-trigger { margin-top: 8px; color: #334155; line-height: 1.7; }
.risk-tree-branch-list { margin: 10px 0 0; padding-left: 18px; color: #475569; line-height: 1.8; }
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

@media (max-width: 960px) {
  .risk-tree-grid { grid-template-columns: 1fr; }
  .chart-group-head { align-items: flex-start; }
  .detail-chart-grid { grid-template-columns: 1fr; }
  .focus-tree-node, .focus-tree-branch { flex-direction: column; gap: 6px; }
  .focus-tree-label, .focus-tree-branch-label { flex-basis: auto; }
}
</style>

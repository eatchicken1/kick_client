<template>
  <div class="config-page">
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再管理该井的检测配置版本。
    </el-alert>

    <template v-else>
      <el-card class="summary-card" shadow="hover" v-loading="pageLoading">
        <div class="summary-head">
          <div>
            <div class="summary-title">PTD v4.1 检测配置管理</div>
            <div class="summary-subtitle">当前页面按在线因果链路展示参数，支持修改当前查看版本、克隆其他井已启用配置，并手动启用目标版本。</div>
          </div>
          <div class="summary-actions">
            <el-button size="small" icon="el-icon-refresh" :loading="pageLoading" @click="reloadCurrent">
              刷新
            </el-button>
            <el-button
              size="small"
              type="primary"
              icon="el-icon-edit-outline"
              @click="beginCreateFromCurrentView">
              修改当前参数
            </el-button>
            <el-button
              size="small"
              type="success"
              plain
              icon="el-icon-document-copy"
              :disabled="!filteredCloneableWellIds.length"
              @click="beginCloneCreate">
              克隆已有配置
            </el-button>
          </div>
        </div>

        <div class="summary-tags">
          <el-tag type="info" effect="dark">{{ currentWellId }}</el-tag>
          <el-tag :type="hasPersistedConfig ? 'success' : 'warning'" effect="plain">
            {{ hasPersistedConfig ? '已存在版本记录' : '暂无井级专属配置' }}
          </el-tag>
          <el-tag :type="isUsingDefaultConfig ? 'warning' : 'success'" effect="plain">
            当前生效：{{ activeConfigLabel }}
          </el-tag>
          <el-tag :type="runtimeStatus.hasActiveRealtimeSessions ? 'danger' : 'info'" effect="plain">
            实时监测会话 {{ runtimeStatus.activeSessionCount }} 个
          </el-tag>
        </div>

        <div class="summary-runtime">
          <span v-if="runtimeStatus.hasActiveRealtimeSessions">
            启用新版本时可只切换默认版本，也可通知当前实时监测按新版本重启。
          </span>
          <span v-else>
            当前没有实时监测会话，启用版本后会在下一次实时监测或历史分析时生效。
          </span>
        </div>
      </el-card>

      <el-card v-if="!hasPersistedConfig" class="empty-card" shadow="hover">
        <div class="empty-title">该井还没有专属检测配置</div>
        <div class="empty-desc">
          当前分析会继续回退到系统默认配置。你可以直接录入一套井级配置，或从其他已配置井克隆一版再调整。
        </div>
        <div class="empty-actions">
          <el-button type="primary" icon="el-icon-edit-outline" @click="beginBlankCreate">
            自己填写
          </el-button>
          <el-button
            type="success"
            plain
            icon="el-icon-document-copy"
            :disabled="!filteredCloneableWellIds.length"
            @click="beginCloneCreate">
            克隆已有井配置
          </el-button>
        </div>
        <div v-if="!filteredCloneableWellIds.length" class="empty-tip">
          当前没有可克隆的已配置井，请先为其他井创建并保存版本。
        </div>
      </el-card>

      <div v-if="hasPersistedConfig" class="content-grid">
        <el-card class="preview-card" shadow="hover" v-loading="previewLoading">
          <div class="card-head">
            <div>
              <div class="card-title">当前查看配置</div>
              <div class="card-subtitle">默认定位到已启用版本，也可以切换查看历史版本。</div>
            </div>
            <div class="card-tags">
              <el-tag size="small" :type="previewConfig.isActive ? 'success' : 'info'" effect="plain">
                {{ previewConfig.isActive ? '已启用' : '未启用' }}
              </el-tag>
              <el-tag v-if="previewConfig.isDefaultConfig" size="small" type="warning" effect="plain">
                系统默认
              </el-tag>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">版本名称</span>
              <span class="meta-value">{{ previewConfig.versionName || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">版本编码</span>
              <span class="meta-value">{{ previewConfig.versionCode || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建人</span>
              <span class="meta-value">{{ previewConfig.createdBy || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建时间</span>
              <span class="meta-value">{{ previewConfig.createdAtLabel || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新时间</span>
              <span class="meta-value">{{ previewConfig.updatedAtLabel || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">来源</span>
              <span class="meta-value">{{ getSourceText(previewConfig) }}</span>
            </div>
          </div>

          <el-divider>基础参数</el-divider>
          <div class="field-grid">
            <div v-for="field in baseFields" :key="field.path" class="field-item">
              <div class="field-label-row">
                <span class="field-label">{{ field.label }}</span>
                <el-tooltip
                  v-if="field.description"
                  effect="dark"
                  placement="top"
                  :content="field.description">
                  <i class="el-icon-question field-help-icon"></i>
                </el-tooltip>
              </div>
              <span class="field-value">{{ formatValue(readConfigValue(previewConfig.config, field.path), field) }}</span>
            </div>
          </div>

          <el-divider>指标窗口参数</el-divider>
          <div class="metric-grid">
            <div v-for="group in metricGroups" :key="group.path" class="metric-card">
              <div class="metric-title-row">
                <div class="metric-title">
                  {{ group.label }}
                  <span v-if="group.abbr" class="field-abbr">{{ group.abbr }}</span>
                </div>
                <el-tooltip
                  v-if="group.description"
                  effect="dark"
                  placement="top"
                  :content="group.description">
                  <i class="el-icon-question field-help-icon"></i>
                </el-tooltip>
              </div>
              <div class="metric-values">
                <div v-for="field in group.fields" :key="group.path + field.prop" class="metric-value-item">
                  <span class="field-label">{{ field.label }}</span>
                  <span class="field-value">
                    {{ formatValue(readConfigValue(previewConfig.config, group.path + '.' + field.prop), field) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <el-divider>V4.1 在线策略参数</el-divider>
          <div class="metric-grid">
            <div v-for="group in strategyGroups" :key="group.path" class="metric-card">
              <div class="metric-title-row">
                <div class="metric-title">
                  {{ group.label }}
                  <span v-if="group.abbr" class="field-abbr">{{ group.abbr }}</span>
                </div>
                <el-tooltip
                  v-if="group.description"
                  effect="dark"
                  placement="top"
                  :content="group.description">
                  <i class="el-icon-question field-help-icon"></i>
                </el-tooltip>
              </div>
              <div class="metric-values">
                <div v-for="field in group.fields" :key="group.path + field.prop" class="metric-value-item">
                  <span class="field-label">{{ field.label }}</span>
                  <span class="field-value">
                    {{ formatValue(readConfigValue(previewConfig.config, group.path + '.' + field.prop), field) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="remark-block">
            <div class="remark-title">版本备注</div>
            <div class="remark-content">{{ previewConfig.remark || '暂无' }}</div>
          </div>
        </el-card>

        <el-card class="versions-card" shadow="hover">
          <div class="card-head">
            <div>
              <div class="card-title">版本列表</div>
              <div class="card-subtitle">保存新版本后不会自动生效，点击“启用”才会切换当前默认版本。</div>
            </div>
          </div>

          <div v-if="versionList.length" class="version-list">
            <div
              v-for="version in versionList"
              :key="version.configVersionId"
              class="version-row"
              :class="{
                'is-active': version.isActive,
                'is-selected': previewVersionId && version.configVersionId === previewVersionId
              }">
              <div class="version-main">
                <div class="version-name-row">
                  <span class="version-name">{{ version.versionName || version.versionCode }}</span>
                  <el-tag v-if="version.isActive" size="mini" type="success" effect="plain">已启用</el-tag>
                  <el-tag v-if="previewVersionId && version.configVersionId === previewVersionId" size="mini" effect="plain">当前查看</el-tag>
                </div>
                <div class="version-desc">
                  <span>{{ version.versionCode || '-' }}</span>
                  <span>更新于 {{ version.updatedAtLabel || '-' }}</span>
                </div>
                <div class="version-desc">{{ version.remark || '暂无版本备注' }}</div>
              </div>
              <div class="version-actions">
                <el-button size="mini" @click="previewVersion(version)">查看</el-button>
                <el-button size="mini" type="text" @click="beginEditFromVersion(version)">修改</el-button>
                <el-button
                  size="mini"
                  type="primary"
                  :disabled="version.isActive"
                  :loading="activatingVersionId === version.configVersionId"
                  @click="activateVersion(version)">
                  启用
                </el-button>
              </div>
            </div>
          </div>

          <div v-else class="empty-inline">暂无版本记录</div>
        </el-card>
      </div>

      <el-dialog
        :visible.sync="editorVisible"
        :title="editorTitle"
        width="1180px"
        top="4vh"
        custom-class="ptd-config-editor-dialog"
        append-to-body
        destroy-on-close
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @close="cancelEditor">
        <div v-loading="saving" class="editor-dialog-body">
          <div class="card-subtitle editor-subtitle">{{ editorSubtitle }}</div>

          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="editor-alert"
            :title="editorAlertTitle" />

          <el-form label-width="110px" size="small" class="editor-form">
            <div class="editor-top-grid">
              <el-form-item label="版本名称" required>
                <el-input v-model.trim="editorDraft.versionName" maxlength="50" show-word-limit placeholder="例如：夜班校准版" />
              </el-form-item>
            </div>

            <div v-if="editorMode === 'clone'" class="clone-section">
              <el-form-item label="克隆来源">
                <el-select
                  v-model="editorDraft.cloneFromWellId"
                  filterable
                  placeholder="请选择已配置井号"
                  style="width: 320px;"
                  @change="handleSourceWellChange">
                  <el-option
                    v-for="wellId in filteredCloneableWellIds"
                    :key="wellId"
                    :label="wellId"
                    :value="wellId" />
                </el-select>
              </el-form-item>
              <div class="clone-hint">
                {{ cloneHintText }}
              </div>
            </div>

            <el-divider>基础参数</el-divider>
            <div class="editor-field-grid">
              <div v-for="field in baseFields" :key="'editor-' + field.path" class="editor-field-item">
                <div class="field-label-row">
                  <label class="editor-label">{{ field.label }}</label>
                  <el-tooltip
                    v-if="field.description"
                    effect="dark"
                    placement="top"
                    :content="field.description">
                    <i class="el-icon-question field-help-icon"></i>
                  </el-tooltip>
                </div>
                <div class="editor-control">
                  <el-input
                    v-if="field.readonly"
                    :value="formatValue(readConfigValue(editorDraft.config, field.path), field)"
                    disabled />
                  <el-input-number
                    v-else
                    :value="readConfigValue(editorDraft.config, field.path)"
                    :min="field.min"
                    :step="field.step"
                    controls-position="right"
                    @change="writeValue(field.path, $event)" />
                  <span v-if="field.unit" class="unit-text">{{ field.unit }}</span>
                </div>
              </div>
            </div>

            <el-divider>指标窗口参数</el-divider>
            <div class="metric-grid">
              <div v-for="group in metricGroups" :key="'editor-' + group.path" class="metric-card">
                <div class="metric-title-row">
                  <div class="metric-title">
                    {{ group.label }}
                    <span v-if="group.abbr" class="field-abbr">{{ group.abbr }}</span>
                  </div>
                  <el-tooltip
                    v-if="group.description"
                    effect="dark"
                    placement="top"
                    :content="group.description">
                    <i class="el-icon-question field-help-icon"></i>
                  </el-tooltip>
                </div>
                <div class="metric-editor-grid">
                  <div v-for="field in group.fields" :key="group.path + '-editor-' + field.prop" class="metric-editor-item">
                    <label class="editor-label">{{ field.label }}</label>
                    <div class="editor-control">
                      <el-input-number
                        :value="readConfigValue(editorDraft.config, group.path + '.' + field.prop)"
                        :min="field.min"
                        :step="field.step"
                        controls-position="right"
                        @change="writeValue(group.path + '.' + field.prop, $event)" />
                      <span v-if="field.unit" class="unit-text">{{ field.unit }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <el-divider>V4.1 在线策略参数</el-divider>
            <div class="metric-grid">
              <div v-for="group in strategyGroups" :key="'editor-' + group.path" class="metric-card">
                <div class="metric-title-row">
                  <div class="metric-title">
                    {{ group.label }}
                    <span v-if="group.abbr" class="field-abbr">{{ group.abbr }}</span>
                  </div>
                  <el-tooltip
                    v-if="group.description"
                    effect="dark"
                    placement="top"
                    :content="group.description">
                    <i class="el-icon-question field-help-icon"></i>
                  </el-tooltip>
                </div>
                <div class="metric-editor-grid">
                  <div v-for="field in group.fields" :key="group.path + '-editor-' + field.prop" class="metric-editor-item">
                    <label class="editor-label">{{ field.label }}</label>
                    <div class="editor-control editor-control-inline">
                      <el-switch
                        v-if="field.type === 'boolean'"
                        :value="Boolean(readConfigValue(editorDraft.config, group.path + '.' + field.prop))"
                        :disabled="Boolean(field.readonly)"
                        active-text="开启"
                        inactive-text="关闭"
                        @change="writeValue(group.path + '.' + field.prop, $event)" />
                      <template v-else>
                        <el-input-number
                          :value="readConfigValue(editorDraft.config, group.path + '.' + field.prop)"
                          :disabled="Boolean(field.readonly)"
                          :min="field.min"
                          :step="field.step"
                          controls-position="right"
                          @change="writeValue(group.path + '.' + field.prop, $event)" />
                        <span v-if="field.unit" class="unit-text">{{ field.unit }}</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <el-divider>版本备注</el-divider>
            <el-form-item label="版本备注">
              <el-input v-model.trim="editorDraft.remark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="说明这次修改目的、适用场景或审批意见" />
            </el-form-item>
          </el-form>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="cancelEditor">取消</el-button>
          <el-button size="small" type="primary" :loading="saving" @click="saveVersion">{{ saveButtonText }}</el-button>
        </span>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import {
  activateUnifiedPtdConfigVersionApi,
  createUnifiedPtdConfigVersionApi,
  getUnifiedPtdConfigApi,
  getUnifiedPtdConfigEditorApi,
  getUnifiedPtdRealtimeRuntimeStatusApi
} from '@/api/index';
import {
  formatDateTime,
  normalizeConfigActivationResponse,
  normalizeConfigDetail,
  normalizeConfigEditorResponse,
  normalizeRealtimeRuntimeStatus
} from '@/utils/ptdRisk';

const baseFields = [
  { label: '配置协议版本', path: 'version', readonly: true, description: '当前统一风险配置的协议版本号，用于识别算法配置结构。' },
  { label: '生效时间', path: 'effectiveAt', readonly: true, type: 'datetime', description: '该配置快照的生效时间标记。' },
  { label: '热身窗口', path: 'warmupWindowSec', type: 'number', unit: 's', min: 0, step: 1, description: '分析起点前额外补取的预热时长，用于建立基线，避免窗口刚开始时阈值不稳定。' },
  { label: '稳定泵窗口', path: 'stablePumpWindowSec', type: 'number', unit: 's', min: 0, step: 1, description: '用于判断泵速和入口流量是否进入稳定段的观察窗口。' },
  { label: '稳定波动比例', path: 'stableVariationRatio', type: 'number', min: 0, step: 0.01, description: '稳定段内允许的最大相对波动比例，越小越严格。' },
  { label: '流量因子窗口', path: 'flowFactorWindowSec', type: 'number', unit: 's', min: 0, step: 1, description: '计算入口/出口流量校准因子的回看窗口长度。' },
  { label: '流量因子钳制', path: 'flowFactorClampRatio', type: 'number', min: 0, step: 0.01, description: '限制流量校准因子的偏离幅度，避免极端值把 ΔFlow 放大。' },
  { label: '事件冷却期', path: 'eventCooldownSec', type: 'number', unit: 's', min: 0, step: 1, description: '异常刚恢复正常后继续保留为同一事件的时间，用于合并短暂抖动。' },
  { label: 'L1 持续时长', path: 'l1MinDurationSec', type: 'number', unit: 's', min: 0, step: 1, description: '单参数异常或前置预警升级为 L1 前要求满足的最短持续时间。' },
  { label: 'L2 持续时长', path: 'l2MinDurationSec', type: 'number', unit: 's', min: 0, step: 1, description: '多参数协同异常升级为 L2 前要求满足的最短持续时间。' },
  { label: 'L3 确认时长', path: 'l3MinDurationSec', type: 'number', unit: 's', min: 0, step: 1, description: 'IADC 兜底确认与持续失衡升级为 L3 前要求满足的最短持续时间。' },
  { label: '断点重置下限', path: 'gapResetFloorSec', type: 'number', unit: 's', min: 0, step: 1, description: '当采样断档超过该秒数时，会强制重置事件连续性。' },
  { label: '断点重置倍率', path: 'gapResetMultiplier', type: 'number', min: 0, step: 0.1, description: '当前采样间隔相对近期中位间隔放大的倍数，超过后会触发断点重置。' }
];

const metricFieldDefs = [
  { label: '短窗', prop: 'shortWindowSec', unit: 's', min: 0, step: 1 },
  { label: '长窗', prop: 'longWindowSec', unit: 's', min: 0, step: 1 },
  { label: 'MAD 窗口', prop: 'madWindowSec', unit: 's', min: 0, step: 1 },
  { label: 'K 因子', prop: 'kFactor', min: 0, step: 0.1 }
];

const metricGroups = [
  {
    label: '出口流量',
    path: 'outletFlow',
    abbr: 'MFOA',
    description: '出口流量。表示井口返出钻井液流量，用于判断回流增减和流入流出是否平衡。'
  },
  {
    label: '立管压力',
    path: 'standpipePress',
    abbr: 'SPPA',
    description: '立管压力。表示循环系统的立压变化，用于识别压力异常、阻力变化和工况扰动。'
  },
  {
    label: '总池体积',
    path: 'poolVolume',
    abbr: 'TVOLACT',
    description: '总池体积。表示地面有效泥浆池总体积，是判断溢流、漏失和池量变化的关键参数。'
  },
  {
    label: '机械参数',
    path: 'mechanical',
    abbr: 'HKLA / TORQA / ROPA',
    description: '机械参数组合。综合钩载 HKLA、扭矩 TORQA 和钻时 ROPA，用于区分机械扰动与真实流体异常。'
  },
  {
    label: '全烃',
    path: 'gas',
    abbr: 'GASA',
    description: '全烃。表示返出气体总量变化，用于辅助识别地层流体侵入和气侵迹象。'
  },
  {
    label: '套压',
    path: 'chokePressure',
    abbr: 'CHKP',
    description: '套压。表示节流或套管侧压力变化，用于观察回压、井口压力和节流状态异常。'
  },
  {
    label: '流量差',
    path: 'flowBalance',
    abbr: 'DeltaFlow',
    description: '流量差。表示入口流量与出口流量的差值，用于快速识别流入流出失衡。'
  },
  {
    label: '流量差积分',
    path: 'flowBalanceIntegral',
    abbr: 'DeltaFlow_int',
    description: '流量差积分。表示流量差随时间的累计效果，用于放大持续性微弱失衡。'
  },
  {
    label: '池增量',
    path: 'pitGain',
    abbr: 'DeltaTVOLACT',
    description: '池增量。表示总池体积相对基线的增量变化，用于识别连续池量上涨或下降。'
  }
].map(item => ({
  ...item,
  fields: metricFieldDefs
}));

const strategyGroups = [
  {
    label: '工况软衰减',
    path: 'softDamping',
    abbr: 'c(t)',
    description: '控制工况切换阶段是否保留信号，以及切换期的软衰减系数。',
    fields: [
      { label: '启用软衰减', prop: 'enabled', type: 'boolean' },
      { label: '切换衰减系数', prop: 'activityTransitionFactor', min: 0, step: 0.05 }
    ]
  },
  {
    label: '动态阈值',
    path: 'dynamicThreshold',
    abbr: 'WMAD',
    description: '控制 PTD 与 PRCD 共用的时间衰减 WMAD、稳定/波动双档 K 与 Huber-M 估计。v4.1 在线链路优先使用因果窗口。',
    fields: [
      { label: '启用动态阈值', prop: 'enabled', type: 'boolean' },
      { label: '半衰期比例', prop: 'halfLifeRatio', min: 0, step: 0.01 },
      { label: '稳定 K', prop: 'stableKFactor', min: 0, step: 0.1 },
      { label: '波动 K', prop: 'volatileKFactor', min: 0, step: 0.1 },
      { label: '波动切换比', prop: 'volatilitySwitchRatio', min: 0, step: 0.05 },
      { label: 'Huber C', prop: 'huberC', min: 0, step: 0.1 },
      { label: 'Huber 迭代', prop: 'huberIterations', min: 0, step: 1 },
      { label: '井段系数', prop: 'wellSectionFactor', min: 0, step: 0.1 }
    ]
  },
  {
    label: '物理阈值兜底',
    path: 'absoluteThresholds',
    abbr: 'ABS',
    description: '控制立压绝对降幅和池增量绝对量的物理兜底逻辑。',
    fields: [
      { label: '启用 SPP 兜底', prop: 'enableSppDropFallback', type: 'boolean' },
      { label: 'SPP 基线门槛', prop: 'sppBaselineMinMpa', unit: 'MPa', min: 0, step: 0.1 },
      { label: 'SPP 绝对降幅', prop: 'sppAbsoluteDropMpa', unit: 'MPa', min: 0, step: 0.01 },
      { label: '启用池增兜底', prop: 'enablePitGainFallback', type: 'boolean' },
      { label: '池增绝对阈值', prop: 'pitGainAbsoluteThresholdM3', unit: 'm³', min: 0, step: 0.1 }
    ]
  },
  {
    label: '螺杆钻进识别',
    path: 'motorDrilling',
    abbr: 'Motor',
    description: '用于识别 slide drilling（低 RPM 且泵开）并屏蔽扭矩误报。',
    fields: [
      { label: '启用识别', prop: 'enabled', type: 'boolean' },
      { label: '最大 RPM', prop: 'maxRpm', unit: 'rpm', min: 0, step: 0.1 },
      { label: '最小总泵冲', prop: 'minPumpSpmTotal', unit: 'spm', min: 0, step: 0.5 }
    ]
  },
  {
    label: 'PRCD 速率偏离',
    path: 'prcd',
    abbr: 'PRCD',
    description: '控制因果 PRCD 速率链路，包括速率平滑、稳健局部斜率、短脉冲抑制、Holt 双指数平滑和交叉抑制。',
    fields: [
      { label: '启用 PRCD', prop: 'enabled', type: 'boolean' },
      { label: '速率平滑点数', prop: 'rateSmoothPoints', min: 0, step: 1 },
      { label: '局部斜率点数', prop: 'localSlopePointCount', min: 0, step: 1 },
      { label: '稳健迭代次数', prop: 'robustIterations', min: 0, step: 1 },
      { label: 'Huber C', prop: 'huberC', min: 0, step: 0.01 },
      { label: '短期 Alpha', prop: 'shortAlpha', min: 0, step: 0.05 },
      { label: '长期 Alpha', prop: 'longAlpha', min: 0, step: 0.05 },
      { label: '交叉抑制系数', prop: 'crossSuppressFactor', min: 0, step: 0.05 }
    ]
  },
  {
    label: '在线因果预处理',
    path: 'preprocessing',
    abbr: 'Prep',
    description: '控制在线因果预处理。v4.1 主链路保留局部异常值抑制、局部去趋势和自适应窗口；整段小波/频域滤波只保留配置位，不进入在线主路径。',
    fields: [
      { label: '在线高级链路（固定开启）', prop: 'enableAdvancedPipeline', type: 'boolean', readonly: true },
      { label: 'Grubbs 过滤', prop: 'enableGrubbsFilter', type: 'boolean' },
      { label: '去线性趋势', prop: 'enableDetrending', type: 'boolean' },
      { label: '小波去噪（在线关闭）', prop: 'enableWaveletDenoise', type: 'boolean', readonly: true },
      { label: '频域滤波（在线关闭）', prop: 'enableFrequencyFilter', type: 'boolean', readonly: true },
      { label: 'Grubbs Sigma', prop: 'grubbsSigmaThreshold', min: 0, step: 0.1 },
      { label: '小波层数', prop: 'waveletLevels', min: 0, step: 1 },
      { label: '周期分量数', prop: 'maxPeriodicComponents', min: 0, step: 1 },
      { label: '周期幅值比', prop: 'periodicAmplitudeRatio', min: 0, step: 0.01 },
      { label: '最小自适应比', prop: 'adaptiveMinRatio', min: 0, step: 0.05 },
      { label: '最大自适应比', prop: 'adaptiveMaxRatio', min: 0, step: 0.05 },
      { label: '熵步长', prop: 'entropyStepSec', unit: 's', min: 0, step: 0.5 },
      { label: '梯度步长', prop: 'gradientStep', min: 0, step: 0.05 },
      { label: '熵分箱数', prop: 'entropyBins', min: 0, step: 1 }
    ]
  }
];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function unwrapData(payload) {
  return payload && payload.data ? payload.data : payload;
}

function buildDefaultRuntimeStatus() {
  return {
    wellId: '',
    hasActiveRealtimeSessions: false,
    activeSessionCount: 0,
    sessions: []
  };
}

function buildDefaultConfigDetail(wellId = '') {
  return normalizeConfigDetail({
    wellId,
    versionCode: 'ptd-risk-v4',
    versionName: '系统默认配置（PTD v4.1 在线因果版）',
    isActive: true,
    isDefaultConfig: true,
    config: {}
  });
}

export default {
  name: 'PtdConfigManager',
  data() {
    return {
      baseFields,
      metricGroups,
      strategyGroups,
      pageLoading: false,
      previewLoading: false,
      saving: false,
      activatingVersionId: '',
      previewVersionId: '',
      previewConfig: buildDefaultConfigDetail(),
      editorContext: {
        currentWellId: '',
        selectedConfigVersionId: '',
        currentConfig: buildDefaultConfigDetail(),
        versions: [],
        cloneableWellIds: []
      },
      runtimeStatus: buildDefaultRuntimeStatus(),
      editorVisible: false,
      editorMode: '',
      editorDraft: {
        versionName: '',
        remark: '',
        baseConfigVersionId: '',
        cloneFromWellId: '',
        config: buildDefaultConfigDetail().config
      }
    };
  },
  computed: {
    currentWellId() {
      return this.$store.state.jh || '';
    },
    configWellId() {
      return this.normalizeWellId(this.currentWellId);
    },
    versionList() {
      return this.editorContext.versions || [];
    },
    hasPersistedConfig() {
      return this.versionList.length > 0;
    },
    isUsingDefaultConfig() {
      return Boolean(this.editorContext.currentConfig && this.editorContext.currentConfig.isDefaultConfig);
    },
    activeConfigLabel() {
      const active = this.editorContext.currentConfig || {};
      return active.versionCode || active.versionName || '未配置';
    },
    filteredCloneableWellIds() {
      return (this.editorContext.cloneableWellIds || []).filter(item => this.normalizeWellId(item) !== this.configWellId);
    },
    editorTitle() {
      if (this.editorMode === 'clone') {
        return '克隆已有井配置';
      }
      if (this.editorMode === 'edit') {
        return '修改当前配置参数';
      }
      if (this.editorMode === 'blank') {
        return '新建井级配置';
      }
      return '基于当前生效版本新增';
    },
    editorSubtitle() {
      if (this.editorMode === 'clone') {
        return '克隆只会读取来源井当前已启用配置，并为当前井生成一个新的版本草稿。';
      }
      if (this.editorMode === 'edit') {
        return '当前正在修改所查看版本的参数。保存后会生成一个新版本快照，原版本保持不变。';
      }
      if (this.editorMode === 'blank') {
        return '当前井还没有专属版本，保存后会落下一条新的井级配置版本。';
      }
      return '新增版本默认只保存草稿，启用后才会影响实时监测和历史分析。';
    },
    editorAlertTitle() {
      if (this.editorMode === 'clone') {
        return '克隆会生成当前井的新版本快照，不会影响来源井当前已启用配置。';
      }
      if (this.editorMode === 'edit') {
        return '修改当前参数只会新增一个修订版本，不会覆盖历史版本，也不会自动启用。';
      }
      return '当前编辑只会生成新版本快照，不会覆盖历史版本，也不会自动启用。';
    },
    saveButtonText() {
      return this.editorMode === 'edit' ? '保存为修订版本' : '保存为新版本';
    },
    cloneHintText() {
      if (!this.editorDraft.cloneFromWellId) {
        return '请选择一个已配置井号，系统会载入它当前已启用的配置作为底稿。';
      }
      return `当前底稿来自井 ${this.editorDraft.cloneFromWellId} 的已启用配置，保存后仍需在本井手动启用。`;
    }
  },
  watch: {
    currentWellId: {
      immediate: true,
      handler() {
        this.loadPageContext();
      }
    }
  },
  methods: {
    normalizeWellId(value) {
      return String(value || '').trim().replace(/-/g, '');
    },
    resetState() {
      const wellId = this.configWellId || this.currentWellId;
      this.previewVersionId = '';
      this.previewConfig = buildDefaultConfigDetail(wellId);
      this.editorContext = {
        currentWellId: wellId,
        selectedConfigVersionId: '',
        currentConfig: buildDefaultConfigDetail(wellId),
        versions: [],
        cloneableWellIds: []
      };
      this.runtimeStatus = buildDefaultRuntimeStatus();
      this.resetEditor();
    },
    resetEditor() {
      this.editorVisible = false;
      this.editorMode = '';
      this.editorDraft = {
        versionName: '',
        remark: '',
        baseConfigVersionId: '',
        cloneFromWellId: '',
        config: deepClone((this.editorContext.currentConfig || {}).config || {})
      };
    },
    async loadPageContext() {
      if (!this.configWellId) {
        this.resetState();
        return;
      }

      this.pageLoading = true;
      this.previewLoading = true;
      this.resetEditor();

      try {
        const [editorPayload, runtimePayload] = await Promise.all([
        getUnifiedPtdConfigEditorApi({ wellId: this.configWellId }),
        getUnifiedPtdRealtimeRuntimeStatusApi({ wellId: this.configWellId })
        ]);

        const editorContext = normalizeConfigEditorResponse(editorPayload);
        const runtimeStatus = normalizeRealtimeRuntimeStatus(runtimePayload);
        this.editorContext = {
          ...editorContext,
          currentConfig: editorContext.currentConfig || buildDefaultConfigDetail(this.configWellId)
        };
        this.runtimeStatus = runtimeStatus;

        if (this.hasPersistedConfig) {
          const activeVersion = this.versionList.find(item => item.isActive);
          const previewVersionId = activeVersion && activeVersion.configVersionId
            ? activeVersion.configVersionId
            : (this.editorContext.currentConfig.configVersionId || '');
          await this.loadPreviewConfig(previewVersionId);
        } else {
          this.previewConfig = this.editorContext.currentConfig || buildDefaultConfigDetail(this.configWellId);
          this.previewVersionId = this.previewConfig.configVersionId || '';
        }
      } catch (error) {
        this.$message.error('加载检测配置失败');
        this.resetState();
      } finally {
        this.pageLoading = false;
        this.previewLoading = false;
      }
    },
    async loadPreviewConfig(configVersionId = '') {
      if (!this.configWellId) {
        return;
      }

      this.previewLoading = true;
      try {
        const payload = await getUnifiedPtdConfigApi({
          wellId: this.configWellId,
          configVersionId: configVersionId || ''
        });
        this.previewConfig = normalizeConfigDetail(unwrapData(payload));
        this.previewVersionId = this.previewConfig.configVersionId || '';
      } catch (error) {
        this.$message.error('加载配置详情失败');
      } finally {
        this.previewLoading = false;
      }
    },
    async reloadCurrent() {
      await this.loadPageContext();
    },
    async previewVersion(version) {
      if (!version || !version.configVersionId) {
        return;
      }
      await this.loadPreviewConfig(version.configVersionId);
    },
    buildEditorDraft(configDetail, overrides = {}) {
      const detail = configDetail || buildDefaultConfigDetail(this.configWellId);
      return {
        versionName: '',
        remark: '',
        baseConfigVersionId: detail.configVersionId || '',
        cloneFromWellId: '',
        config: deepClone(detail.config || {}),
        ...overrides
      };
    },
    async beginEditFromVersion(version) {
      const targetVersionId = version && version.configVersionId ? version.configVersionId : '';
      let target = version || this.previewConfig || buildDefaultConfigDetail(this.configWellId);

      if (targetVersionId && !target.config) {
        this.previewLoading = true;
        try {
        const payload = await getUnifiedPtdConfigApi({
            wellId: this.configWellId,
            configVersionId: targetVersionId
          });
          target = normalizeConfigDetail(unwrapData(payload));
        } catch (error) {
          this.$message.error('加载待修改配置失败');
          return;
        } finally {
          this.previewLoading = false;
        }
      } else {
        target = normalizeConfigDetail(target);
      }

      this.editorVisible = true;
      this.editorMode = 'edit';
      this.editorDraft = this.buildEditorDraft(target, {
        versionName: '',
        remark: ''
      });
    },
    beginCreateFromCurrentView() {
      this.beginEditFromVersion(this.previewConfig);
    },
    beginBlankCreate() {
      const seedConfig = (this.editorContext.currentConfig || buildDefaultConfigDetail(this.configWellId)).config || {};
      this.editorVisible = true;
      this.editorMode = 'blank';
      this.editorDraft = this.buildEditorDraft(buildDefaultConfigDetail(this.configWellId), {
        baseConfigVersionId: '',
        cloneFromWellId: '',
        config: deepClone(seedConfig)
      });
    },
    async beginCloneCreate() {
      if (!this.filteredCloneableWellIds.length) {
        this.$message.warning('当前没有可克隆的已配置井');
        return;
      }

      const seedConfig = (this.editorContext.currentConfig || buildDefaultConfigDetail(this.configWellId)).config || {};
      this.editorVisible = true;
      this.editorMode = 'clone';
      this.editorDraft = this.buildEditorDraft(buildDefaultConfigDetail(this.configWellId), {
        baseConfigVersionId: '',
        cloneFromWellId: '',
        config: deepClone(seedConfig)
      });

      if (this.filteredCloneableWellIds.length === 1) {
        this.editorDraft.cloneFromWellId = this.filteredCloneableWellIds[0];
        await this.cloneFromSource();
      }
    },
    cancelEditor() {
      this.resetEditor();
    },
    async handleSourceWellChange() {
      if (!this.editorDraft.cloneFromWellId) {
        return;
      }
      await this.cloneFromSource();
    },
    async cloneFromSource() {
      if (!this.editorDraft.cloneFromWellId) {
        this.$message.warning('请先选择克隆来源井');
        return;
      }

      this.previewLoading = true;
      try {
        const payload = await getUnifiedPtdConfigApi({ wellId: this.editorDraft.cloneFromWellId });
        const detail = normalizeConfigDetail(unwrapData(payload));
        this.editorDraft = {
          ...this.editorDraft,
          baseConfigVersionId: '',
          config: deepClone(detail.config || {})
        };
        this.$message.success(`已载入井 ${this.editorDraft.cloneFromWellId} 的已启用配置`);
      } catch (error) {
        this.$message.error('克隆来源配置加载失败');
      } finally {
        this.previewLoading = false;
      }
    },
    readConfigValue(config, path) {
      const segments = String(path || '').split('.').filter(Boolean);
      let current = config || {};

      for (let i = 0; i < segments.length; i += 1) {
        const key = segments[i];
        if (current == null || !Object.prototype.hasOwnProperty.call(current, key)) {
          return '';
        }
        current = current[key];
      }

      return current;
    },
    writeValue(path, value) {
      const segments = String(path || '').split('.').filter(Boolean);
      if (!segments.length) {
        return;
      }

      const nextConfig = deepClone(this.editorDraft.config || {});
      let current = nextConfig;
      for (let i = 0; i < segments.length - 1; i += 1) {
        const key = segments[i];
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }

      current[segments[segments.length - 1]] = value === null || value === undefined ? 0 : value;
      this.editorDraft = {
        ...this.editorDraft,
        config: nextConfig
      };
    },
    formatValue(value, field = {}) {
      if (value === null || value === undefined || value === '') {
        return '-';
      }

      if (field.type === 'boolean') {
        return value ? '开启' : '关闭';
      }

      if (field.type === 'datetime' || field.path === 'effectiveAt') {
        return formatDateTime(value);
      }

      if (typeof value === 'number') {
        const stepText = String(field.step || '');
        const precision = stepText.indexOf('.') >= 0 ? stepText.split('.')[1].length : 0;
        const text = value.toFixed(precision);
        return field.unit ? `${text} ${field.unit}` : text;
      }

      return String(value);
    },
    getSourceText(version) {
      if (!version || !version.sourceWellId) {
        return '本井直接创建';
      }

      if (version.sourceVersionCode) {
        return `${version.sourceWellId} / ${version.sourceVersionCode}`;
      }

      return version.sourceWellId;
    },
    async saveVersion() {
      if (!this.configWellId) {
        this.$message.warning('请先选择井号');
        return;
      }

      if (!this.editorDraft.versionName) {
        this.$message.warning('请填写版本名称');
        return;
      }

      if (this.editorMode === 'clone' && !this.editorDraft.cloneFromWellId) {
        this.$message.warning('请选择克隆来源井');
        return;
      }

      const config = deepClone(this.editorDraft.config || {});
      if (!config.effectiveAt) {
        config.effectiveAt = new Date().toISOString();
      }

      this.saving = true;
      try {
        const payload = await createUnifiedPtdConfigVersionApi({
          wellId: this.configWellId,
          baseConfigVersionId: this.editorDraft.baseConfigVersionId || '',
          cloneFromWellId: this.editorDraft.cloneFromWellId || '',
          versionName: this.editorDraft.versionName,
          remark: this.editorDraft.remark || '',
          operator: 'ui',
          setActive: false,
          config
        });
        const saved = normalizeConfigDetail(unwrapData(payload));
        this.$message.success(`版本 ${saved.versionCode || saved.versionName} 已保存，启用后才会生效`);
        await this.loadPageContext();
        if (saved.configVersionId) {
          await this.loadPreviewConfig(saved.configVersionId);
        }
        this.resetEditor();
      } catch (error) {
        this.$message.error('保存配置版本失败');
      } finally {
        this.saving = false;
      }
    },
    async refreshRuntimeStatus() {
      if (!this.configWellId) {
        this.runtimeStatus = buildDefaultRuntimeStatus();
        return this.runtimeStatus;
      }

      try {
        const payload = await getUnifiedPtdRealtimeRuntimeStatusApi({ wellId: this.configWellId });
        this.runtimeStatus = normalizeRealtimeRuntimeStatus(payload);
      } catch (error) {
        this.runtimeStatus = buildDefaultRuntimeStatus();
      }

      return this.runtimeStatus;
    },
    async activateVersion(version) {
      if (!version || !version.configVersionId) {
        return;
      }

      if (version.isActive) {
        this.$message.info('该版本已经是当前启用版本');
        await this.previewVersion(version);
        return;
      }

      await this.refreshRuntimeStatus();
      let restartRealtimeSessions = false;

      if (this.runtimeStatus.hasActiveRealtimeSessions) {
        try {
          await this.$confirm(
            `当前井存在 ${this.runtimeStatus.activeSessionCount} 个实时监测会话。` +
            '你可以只切换默认版本，让当前监测继续沿用旧配置；也可以通知当前实时监测停止并按新版本重新启动。',
            '启用配置版本',
            {
              type: 'warning',
              distinguishCancelAndClose: true,
              confirmButtonText: '仅启用为默认版本',
              cancelButtonText: '启用并重启实时监测',
              closeOnClickModal: false,
              closeOnPressEscape: false
            }
          );
          restartRealtimeSessions = false;
        } catch (action) {
          if (action === 'cancel') {
            restartRealtimeSessions = true;
          } else {
            return;
          }
        }
      }

      this.activatingVersionId = version.configVersionId;
      try {
        const payload = await activateUnifiedPtdConfigVersionApi({
          wellId: this.configWellId,
          configVersionId: version.configVersionId,
          operator: 'ui',
          restartRealtimeSessions
        });
        const activationResult = normalizeConfigActivationResponse(payload);
        const activatedConfig = activationResult.config || normalizeConfigDetail(version);
        this.previewConfig = activatedConfig;
        this.previewVersionId = activatedConfig.configVersionId || version.configVersionId;

        const activeSessionCount = activationResult.activeRealtimeSessionCount || 0;
        const restartedSessionCount = activationResult.restartedRealtimeSessionCount || 0;
        this.$message.success(
          restartRealtimeSessions
            ? `版本已启用，已通知 ${restartedSessionCount} 个实时监测会话按新配置重启`
            : activeSessionCount > 0
              ? `版本已启用，当前 ${activeSessionCount} 个实时监测会话继续沿用旧配置运行`
              : '版本已启用'
        );
        await this.loadPageContext();
        await this.loadPreviewConfig(activatedConfig.configVersionId || version.configVersionId);
      } catch (error) {
        this.$message.error('启用配置版本失败');
      } finally {
        this.activatingVersionId = '';
      }
    }
  }
};
</script>

<style scoped>
.config-page {
  padding: 16px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
}

.well-alert {
  margin-bottom: 16px;
}

.summary-card,
.empty-card,
.preview-card,
.versions-card {
  border-radius: 18px;
}

.summary-card,
.empty-card {
  margin-bottom: 16px;
}

.summary-head,
.card-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.summary-title,
.card-title,
.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.summary-subtitle,
.card-subtitle,
.empty-desc,
.empty-tip,
.summary-runtime,
.version-desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.summary-actions,
.card-tags,
.version-actions,
.empty-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.summary-runtime {
  margin-top: 14px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 16px;
  align-items: start;
}

.meta-grid,
.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.meta-item,
.field-item,
.metric-card,
.remark-block,
.version-row {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.meta-item,
.field-item {
  padding: 14px;
}

.remark-block {
  padding: 14px;
  margin-top: 12px;
  background: #f8fafc;
}

.remark-title,
.metric-title,
.version-name {
  color: #0f172a;
  font-weight: 600;
}

.remark-content {
  margin-top: 8px;
  color: #475569;
  line-height: 1.7;
  white-space: pre-wrap;
}

.meta-label,
.field-label,
.editor-label {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
}

.field-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.field-label-row .field-label,
.field-label-row .editor-label {
  margin-bottom: 0;
}

.meta-value,
.field-value {
  color: #0f172a;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.metric-values,
.metric-editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.metric-value-item,
.metric-editor-item {
  min-width: 0;
}

.editor-control-inline {
  align-items: center;
}

.metric-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.field-abbr {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 11px;
  font-weight: 600;
}

.field-help-icon {
  margin-top: 1px;
  color: #94a3b8;
  font-size: 14px;
  cursor: help;
  transition: color 0.2s ease;
}

.field-help-icon:hover {
  color: #2563eb;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-row {
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.2s ease;
}

.version-row.is-active {
  border-color: #22c55e;
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.08);
}

.version-row.is-selected {
  border-color: #2563eb;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.version-main {
  min-width: 0;
  flex: 1;
}

.version-name-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.editor-alert {
  margin-top: 12px;
}

.editor-form {
  margin-top: 18px;
}

.editor-dialog-body {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  padding-right: 4px;
}

.editor-subtitle {
  margin-bottom: 12px;
}

.editor-top-grid,
.editor-field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px 16px;
}

.editor-field-item {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.editor-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-text {
  color: #64748b;
  font-size: 12px;
}

.clone-section {
  padding: 14px 16px;
  margin-top: 8px;
  border: 1px dashed #93c5fd;
  border-radius: 14px;
  background: rgba(239, 246, 255, 0.75);
}

.clone-hint {
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

.empty-card {
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
}

.empty-desc {
  max-width: 680px;
  margin: 12px auto 0;
}

.empty-actions {
  justify-content: center;
  margin-top: 18px;
}

.empty-tip,
.empty-inline {
  margin-top: 14px;
  text-align: center;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-head,
  .card-head,
  .version-row {
    flex-direction: column;
  }

  .metric-values,
  .metric-editor-grid {
    grid-template-columns: 1fr;
  }
}
</style>

export const PTD_STATUS_OPTIONS = [
    { value: 'NEW', label: '待确认', type: 'info' },
    { value: 'ACKNOWLEDGED', label: '已确认', type: 'warning' },
    { value: 'PROCESSING', label: '处理中', type: 'primary' },
    { value: 'TIMEOUT', label: '已超时', type: 'danger' },
    { value: 'CLOSED', label: '已关闭', type: 'success' }
];

export const PTD_SEVERITY_META = {
    L0: { code: 'L0', level: 0, label: '正常', tagType: 'success', color: '#16a34a', areaColor: 'rgba(22, 163, 74, 0.12)' },
    L1: { code: 'L1', level: 1, label: '关注', tagType: 'info', color: '#2563eb', areaColor: 'rgba(37, 99, 235, 0.14)' },
    L2: { code: 'L2', level: 2, label: '疑似溢流', tagType: 'warning', color: '#d97706', areaColor: 'rgba(217, 119, 6, 0.14)' },
    L3: { code: 'L3', level: 3, label: '确认溢流', tagType: 'danger', color: '#dc2626', areaColor: 'rgba(220, 38, 38, 0.16)' }
};

export const PTD_METRIC_FALLBACKS = {
    poolVolume: { code: 'poolVolume', label: '总池体积 TVOLACT', unit: 'm³' },
    outletFlow: { code: 'outletFlow', label: '出口流量 MFOA', unit: 'L/s' },
    standpipePress: { code: 'standpipePress', label: '立管压力 SPPA', unit: 'MPa' },
    hookLoad: { code: 'hookLoad', label: '钩载 HKLA', unit: 'kN' },
    torque: { code: 'torque', label: '扭矩 TORQA', unit: 'kN.m' },
    rop: { code: 'rop', label: '钻时 ROPA', unit: 'min/m' },
    pumpSpmTotal: { code: 'pumpSpmTotal', label: '总泵冲 SPM', unit: 'spm' },
    flowIn: { code: 'flowIn', label: '入口流量 MFIA', unit: 'L/s' },
    gas: { code: 'gas', label: '全烃 GASA', unit: '%' },
    chokePressure: { code: 'chokePressure', label: '套压 CHKP', unit: 'MPa' },
    flowBalance: { code: 'flowBalance', label: '流量差 ΔFlow', unit: 'L/s' },
    flowBalanceIntegral: { code: 'flowBalanceIntegral', label: '流量差积分 ΔFlow_int', unit: 'L' },
    pitGain: { code: 'pitGain', label: '池增量 ΔTVOLACT', unit: 'm³' }
};

const DEFAULT_PTD_CONFIG = {
    version: 'ptd-risk-v4',
    effectiveAt: new Date('2026-03-24T00:00:00'),
    approvedBy: 'system',
    remark: '',
    warmupWindowSec: 1800,
    stablePumpWindowSec: 20,
    stableVariationRatio: 0.05,
    flowFactorWindowSec: 600,
    flowFactorClampRatio: 0.15,
    eventCooldownSec: 30,
    gapResetFloorSec: 30,
    gapResetMultiplier: 3.0,
    l1MinDurationSec: 20,
    l2MinDurationSec: 60,
    l3MinDurationSec: 90,
    softDamping: {
        enabled: true,
        activityTransitionFactor: 0.3
    },
    dynamicThreshold: {
        enabled: true,
        halfLifeRatio: 1 / 3,
        stableKFactor: 3.5,
        volatileKFactor: 4.5,
        volatilitySwitchRatio: 1.25,
        huberC: 1.5,
        huberIterations: 2,
        wellSectionFactor: 1.0
    },
    absoluteThresholds: {
        enableSppDropFallback: true,
        sppBaselineMinMpa: 5.0,
        sppAbsoluteDropMpa: 0.2,
        enablePitGainFallback: true,
        pitGainAbsoluteThresholdM3: 1.0
    },
    motorDrilling: {
        enabled: true,
        maxRpm: 3.0,
        minPumpSpmTotal: 5.0
    },
    prcd: {
        enabled: true,
        rateSmoothPoints: 5,
        localSlopePointCount: 5,
        robustIterations: 4,
        huberC: 4.685,
        shortAlpha: 0.5,
        longAlpha: 0.1,
        crossSuppressFactor: 0.5
    },
    preprocessing: {
        enableAdvancedPipeline: true,
        enableGrubbsFilter: true,
        enableDetrending: true,
        enableWaveletDenoise: false,
        enableFrequencyFilter: false,
        grubbsSigmaThreshold: 3.5,
        waveletLevels: 3,
        maxPeriodicComponents: 3,
        periodicAmplitudeRatio: 0.2,
        adaptiveMinRatio: 0.5,
        adaptiveMaxRatio: 2.0,
        entropyStepSec: 6.0,
        gradientStep: 0.5,
        entropyBins: 8
    },
    outletFlow: { shortWindowSec: 30, longWindowSec: 120, madWindowSec: 300, kFactor: 2.0 },
    standpipePress: { shortWindowSec: 20, longWindowSec: 120, madWindowSec: 300, kFactor: 2.5 },
    poolVolume: { shortWindowSec: 120, longWindowSec: 300, madWindowSec: 300, kFactor: 2.5 },
    mechanical: { shortWindowSec: 30, longWindowSec: 180, madWindowSec: 300, kFactor: 2.5 },
    gas: { shortWindowSec: 45, longWindowSec: 300, madWindowSec: 300, kFactor: 2.0 },
    chokePressure: { shortWindowSec: 30, longWindowSec: 180, madWindowSec: 300, kFactor: 2.0 },
    flowBalance: { shortWindowSec: 30, longWindowSec: 180, madWindowSec: 300, kFactor: 2.0 },
    flowBalanceIntegral: { shortWindowSec: 120, longWindowSec: 300, madWindowSec: 300, kFactor: 2.0 },
    pitGain: { shortWindowSec: 120, longWindowSec: 300, madWindowSec: 300, kFactor: 2.0 }
};

const LEGACY_PTD_PROTOCOL_CODE_PATTERN = /\bptd-risk-v(?:1|2|3)\b/gi;
const LEGACY_PTD_PROTOCOL_LABEL_PATTERN = /\bPTD\s*[Vv]\s*(?:1|2|3)\b/gi;

const ACTIVITY_BUCKET_LABELS = {
    rotary_drilling: '转盘钻进',
    slide_drilling: '螺杆滑动钻进',
    circulation: '循环',
    reaming: '划眼',
    trip_in: '下钻',
    trip_out: '起钻',
    waiting: '等待',
    stuck: '坐卡',
    other: '其他'
};

const EVIDENCE_RISK_TYPE_FALLBACK_MAP = {
    flow_high: '出口流量持续异常',
    flow_low: '出口流量持续下降',
    spp_low: '立管压力持续异常',
    pool_high: '总池体积持续异常',
    pool_low: '总池体积持续下降',
    pit_gain: '池增量持续异常',
    gas_high: '全烃持续异常',
    choke_high: '套压持续异常',
    torque_low: '扭矩持续异常',
    rop_low: '钻时持续异常',
    hook_high: '钩载持续异常',
    gas_accel: '全烃速率加速',
    flow_accel: '出口流量速率加速',
    spp_decel: '立管压力下降速率加快',
    blowoff_precursor: '溢流前兆-放空',
    gas_invasion_pattern: '气侵溢流',
    late_kick_pattern: '后期溢流',
    bit_nozzle_drop: '疑似钻头水眼掉落',
    motor_stall: '疑似憋螺杆/螺杆失效',
    drillstring_washout: '疑似钻具刺漏',
    loss_circulation_pattern: '疑似井漏-流量与池量同步下降',
    spp_transition_drop: '工况切换期立压骤降'
};

const RISK_TYPE_META_MAP = {
    正常: { label: '正常', family: '观察', tagType: 'success', summary: '当前以门控、持续时间或协同关系不足为主，系统保持观察。' },
    IADC确认溢流: { label: 'IADC确认溢流', family: '确认溢流', tagType: 'danger', summary: '池增量与流量差积分已形成持续正向协同，满足确认级溢流链路。' },
    停泵仍有回流: { label: '停泵仍有回流', family: '确认溢流', tagType: 'danger', summary: '停泵后仍检测到明显回流，是最强的井控确认信号之一。' },
    气侵溢流: { label: '气侵溢流', family: '协同预警', tagType: 'warning', summary: '流量、池量与压力/气测已出现正向协同，符合气侵早期模式。' },
    后期溢流: { label: '后期溢流', family: '协同预警', tagType: 'warning', summary: '立压不一定明显下降，但流量、池量或流量差已形成后期流入协同。' },
    '流量加速+立压减速': { label: '流量加速+立压减速', family: '协同预警', tagType: 'warning', summary: 'PRCD 前兆链已提示出口流量在加速偏离，而立压下降速率同步放大。' },
    气测与流量同步加速: { label: '气测与流量同步加速', family: '协同预警', tagType: 'warning', summary: '气测和流量同时出现速率偏离，适合捕捉绝对值尚未越线的前兆窗口。' },
    '出口流量升高+立压下降': { label: '出口流量升高+立压下降', family: '协同预警', tagType: 'warning', summary: '经典正向流入组合，出口流量抬升且立压同步走低。' },
    '出口流量升高+池增量持续': { label: '出口流量升高+池增量持续', family: '协同预警', tagType: 'warning', summary: '出口回流和池量同步放大，说明异常更偏向真实流体进入系统。' },
    '溢流前兆-放空': { label: '溢流前兆-放空', family: '先导预警', tagType: 'info', summary: '命中“三降一升”组合，通常是钻进扰动与早期流入共同出现的前置征兆。' },
    '工况切换期立压骤降': { label: '工况切换期立压骤降', family: '工况扰动', tagType: 'info', summary: '切换期仍处于恒泵段，立压相对稳定基线快速下挫，需继续观察是否扩展为协同异常。' },
    '疑似地面操作/加泥': { label: '疑似地面操作/加泥', family: '地面操作', tagType: 'info', summary: '当前主要是池量阶跃，缺少正向流入协同，优先按地面操作解释。' },
    '疑似井漏-流量与池量同步下降': { label: '疑似井漏-流量与池量同步下降', family: '井漏/漏失', tagType: 'info', summary: '出口流量与池量同步下降，更像漏失而不是溢流，系统会封顶在 L1。' },
    '疑似钻具刺漏': { label: '疑似钻具刺漏', family: '设备故障', tagType: 'info', summary: '立压和出口流量同步下降，但池量、气测和套压没有正向协同，优先排查钻具刺漏。' },
    '疑似钻头水眼掉落': { label: '疑似钻头水眼掉落', family: '设备故障', tagType: 'info', summary: '立压骤降且出口流量跃升，但缺少池增和气测协同，更偏向水眼掉落或循环件失效。' },
    '疑似憋螺杆/螺杆失效': { label: '疑似憋螺杆/螺杆失效', family: '设备故障', tagType: 'info', summary: '滑动钻进中立压上升、钻时下滑、扭矩抬升，优先考虑螺杆或钻具机械故障。' },
    '全烃速率加速': { label: '全烃速率加速', family: '先导预警', tagType: 'info', summary: 'PRCD 已先于绝对值穿阈识别到气测增速抬升，适合作为前兆提示。' },
    '出口流量速率加速': { label: '出口流量速率加速', family: '先导预警', tagType: 'info', summary: '出口流量绝对值尚可，但增速已出现因果偏离，通常是更早的流入征兆。' },
    '出口流量持续异常': { label: '出口流量持续异常', family: '先导预警', tagType: 'info', summary: '出口流量已持续偏离本工况下的稳定基线。' },
    '出口流量持续下降': { label: '出口流量持续下降', family: '先导预警', tagType: 'info', summary: '出口流量持续低于基线，需结合池量和压力判断是门控扰动、设备故障还是井漏。' },
    '立管压力持续异常': { label: '立管压力持续异常', family: '先导预警', tagType: 'info', summary: '立压相对基线持续偏离，需结合流量与工况判断是流入还是机械扰动。' },
    '池增量持续异常': { label: '池增量持续异常', family: '先导预警', tagType: 'info', summary: '最近窗口池量增量已持续偏离，是井控确认链的重要前置证据。' },
    '总池体积持续异常': { label: '总池体积持续异常', family: '先导预警', tagType: 'info', summary: '总池体积已相对基线持续偏离，通常需要结合流量差和立压一起解释。' }
};

export function normalizePtdProtocolVersionText(value, fallback = '') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return String(value)
        .replace(LEGACY_PTD_PROTOCOL_CODE_PATTERN, 'ptd-risk-v4')
        .replace(LEGACY_PTD_PROTOCOL_LABEL_PATTERN, 'PTD v4');
}

export function getActivityBucketLabel(bucket, activityCode = '') {
    const normalized = String(bucket || '').trim().toLowerCase();
    if (normalized && ACTIVITY_BUCKET_LABELS[normalized]) {
        return ACTIVITY_BUCKET_LABELS[normalized];
    }

    const rawCode = String(activityCode || '').trim();
    return rawCode || '-';
}

function inferRiskTypeFromEvidence(evidenceItems) {
    const evidence = Array.isArray(evidenceItems) ? evidenceItems : [];
    const primary = evidence.find(item => item && item.code && EVIDENCE_RISK_TYPE_FALLBACK_MAP[item.code]);
    return primary ? EVIDENCE_RISK_TYPE_FALLBACK_MAP[primary.code] : '';
}

export function getRiskTypeMeta(riskType, evidenceItems = []) {
    const raw = String(riskType || '').trim();
    const fallback = inferRiskTypeFromEvidence(evidenceItems);
    const resolved = (!raw || raw === '单参数持续异常' || (raw === '总池体积持续异常' && fallback))
        ? (fallback || raw || '正常')
        : raw;

    if (RISK_TYPE_META_MAP[resolved]) {
        return RISK_TYPE_META_MAP[resolved];
    }

    if (resolved.includes('井漏')) {
        return { label: resolved, family: '井漏/漏失', tagType: 'info', summary: '该事件更偏向漏失链路，前端会按设备/漏失分流展示，不进入高等级溢流确认。' };
    }

    if (resolved.includes('钻具刺漏') || resolved.includes('水眼掉落') || resolved.includes('螺杆')) {
        return { label: resolved, family: '设备故障', tagType: 'info', summary: '该事件已被后端从正向流入链路分流，优先按设备或工况故障排查。' };
    }

    if (resolved.includes('溢流') || resolved.includes('回流') || resolved.includes('流量加速')) {
        return { label: resolved, family: '协同预警', tagType: 'warning', summary: '该事件已具备正向流入迹象，建议优先核对井控主证据。' };
    }

    if (resolved.includes('地面操作')) {
        return { label: resolved, family: '地面操作', tagType: 'info', summary: '当前更像地面操作引起的池量或循环扰动，建议先排除作业干预。' };
    }

    return { label: resolved || '正常', family: '观察', tagType: 'info', summary: '当前事件仍需结合详细证据与曲线联动判断。' };
}

function pick(source, keys, fallback) {
    if (!source) {
        return fallback;
    }

    for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined && source[key] !== null) {
            return source[key];
        }
    }

    return fallback;
}

export function toNumber(value, fallback = null) {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function toBoolean(value, fallback = false) {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
        return true;
    }

    if (normalized === 'false' || normalized === '0') {
        return false;
    }

    return fallback;
}

export function toDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    let date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date;
    }

    const normalized = String(value).trim().replace('T', ' ').replace(/-/g, '/');
    date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function pad(value) {
    return String(value).padStart(2, '0');
}

export function formatDateTime(value) {
    const date = toDate(value);
    if (!date) {
        return '-';
    }

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatNumber(value, precision = 2) {
    const numeric = toNumber(value);
    if (numeric === null) {
        return '-';
    }

    return numeric.toFixed(precision);
}

export function formatDuration(seconds) {
    const total = Math.max(0, Math.round(toNumber(seconds, 0)));
    if (total < 60) {
        return `${total}s`;
    }

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remain = total % 60;
    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0 || hours > 0) {
        parts.push(`${minutes}m`);
    }

    parts.push(`${remain}s`);
    return parts.join(' ');
}

export function normalizeStatus(status) {
    const value = String(status || 'NEW').trim().toUpperCase();
    const valid = PTD_STATUS_OPTIONS.find(item => item.value === value);
    return valid ? valid.value : 'NEW';
}

export function getStatusMeta(status) {
    const normalized = normalizeStatus(status);
    return PTD_STATUS_OPTIONS.find(item => item.value === normalized) || PTD_STATUS_OPTIONS[0];
}

export function canTransitionPtdStatus(currentStatus, nextStatus) {
    const normalizedNext = normalizeStatus(nextStatus);
    const rawCurrent = String(currentStatus || 'NEW').trim().toUpperCase();
    const normalizedCurrent = rawCurrent === 'TIMEOUT' ? 'NEW' : normalizeStatus(rawCurrent);

    if (normalizedCurrent === normalizedNext) {
        return false;
    }

    switch (normalizedCurrent) {
        case 'NEW':
            return normalizedNext === 'ACKNOWLEDGED' || normalizedNext === 'PROCESSING' || normalizedNext === 'CLOSED';
        case 'ACKNOWLEDGED':
            return normalizedNext === 'PROCESSING' || normalizedNext === 'CLOSED';
        case 'PROCESSING':
            return normalizedNext === 'CLOSED';
        case 'CLOSED':
            return false;
        default:
            return normalizedNext === 'ACKNOWLEDGED' || normalizedNext === 'PROCESSING' || normalizedNext === 'CLOSED';
    }
}

export function normalizeSeverityCode(value, levelHint) {
    if (typeof value === 'string' && /^L[0-3]$/i.test(value.trim())) {
        return value.trim().toUpperCase();
    }

    const level = toNumber(levelHint, null);
    if (level !== null && level >= 0 && level <= 3) {
        return `L${Math.round(level)}`;
    }

    const parsed = toNumber(value, null);
    if (parsed !== null && parsed >= 0 && parsed <= 3) {
        return `L${Math.round(parsed)}`;
    }

    return 'L0';
}

export function getSeverityMeta(severity, levelHint) {
    const code = normalizeSeverityCode(severity, levelHint);
    return PTD_SEVERITY_META[code] || PTD_SEVERITY_META.L0;
}

export function normalizeDirection(value) {
    if (typeof value === 'number') {
        if (value > 0) {
            return 'HIGH';
        }
        if (value < 0) {
            return 'LOW';
        }
        return 'NONE';
    }

    const text = String(value || '').trim().toUpperCase();
    if (text === 'HIGH') {
        return 'HIGH';
    }
    if (text === 'LOW') {
        return 'LOW';
    }
    return 'NONE';
}

export function normalizeEvidenceItem(raw) {
    const direction = normalizeDirection(pick(raw, ['direction', 'Direction'], 'NONE'));
    return {
        code: pick(raw, ['code', 'Code'], ''),
        label: pick(raw, ['label', 'Label'], ''),
        direction,
        value: toNumber(pick(raw, ['value', 'Value'], null)),
        baseline: toNumber(pick(raw, ['baseline', 'Baseline'], null)),
        threshold: toNumber(pick(raw, ['threshold', 'Threshold'], null)),
        ratio: toNumber(pick(raw, ['ratio', 'Ratio'], null)),
        windowSec: toNumber(pick(raw, ['windowSec', 'WindowSec'], null)),
        note: pick(raw, ['note', 'Note'], '')
    };
}

export function normalizeMetric(raw, metricKey) {
    const fallback = PTD_METRIC_FALLBACKS[metricKey] || { code: metricKey, label: metricKey, unit: '' };
    return {
        code: pick(raw, ['code', 'Code'], fallback.code),
        label: pick(raw, ['label', 'Label'], fallback.label),
        unit: pick(raw, ['unit', 'Unit'], fallback.unit),
        originalValue: toNumber(pick(raw, ['originalValue', 'OriginalValue'], null)),
        baseline: toNumber(pick(raw, ['baseline', 'Baseline'], null)),
        ptdValue: toNumber(pick(raw, ['ptdValue', 'PtdValue'], null)),
        prcdValue: toNumber(pick(raw, ['prcdValue', 'PrcdValue'], null)),
        prcdBaseline: toNumber(pick(raw, ['prcdBaseline', 'PrcdBaseline'], null)),
        upperThreshold: toNumber(pick(raw, ['upperThreshold', 'UpperThreshold'], null)),
        lowerThreshold: toNumber(pick(raw, ['lowerThreshold', 'LowerThreshold'], null)),
        prcdUpperThreshold: toNumber(pick(raw, ['prcdUpperThreshold', 'PrcdUpperThreshold'], null)),
        prcdLowerThreshold: toNumber(pick(raw, ['prcdLowerThreshold', 'PrcdLowerThreshold'], null)),
        isAnomaly: Boolean(pick(raw, ['isAnomaly', 'IsAnomaly'], false)),
        direction: normalizeDirection(pick(raw, ['direction', 'Direction'], 'NONE')),
        isPrcdAnomaly: Boolean(pick(raw, ['isPrcdAnomaly', 'IsPrcdAnomaly'], false)),
        prcdDirection: normalizeDirection(pick(raw, ['prcdDirection', 'PrcdDirection'], 'NONE')),
        ratio: toNumber(pick(raw, ['ratio', 'Ratio'], null)),
        prcdRatio: toNumber(pick(raw, ['prcdRatio', 'PrcdRatio'], null)),
        windowSeconds: toNumber(pick(raw, ['windowSeconds', 'WindowSeconds'], null)),
        adaptiveWindowSeconds: toNumber(pick(raw, ['adaptiveWindowSeconds', 'AdaptiveWindowSeconds'], null)),
        isEnabled: Boolean(pick(raw, ['isEnabled', 'IsEnabled'], true)),
        note: pick(raw, ['note', 'Note'], '')
    };
}

export function normalizeFrame(raw) {
    const metricsRaw = pick(raw, ['metrics', 'Metrics'], {}) || {};
    const timestamp = toDate(pick(raw, ['timestamp', 'Timestamp'], null));
    const severity = normalizeSeverityCode(
        pick(raw, ['severity', 'Severity'], 'L0'),
        pick(raw, ['severityLevel', 'SeverityLevel'], 0)
    );
    const depth = pickDepthValue(raw, ['depth', 'Depth', 'deptMeas', 'DeptMeas', 'DEPTMEAS', 'deptVert', 'DeptVert', 'DEPTVERT']);
    const bitDepth = pickDepthValue(raw, ['bitDepth', 'BitDepth', 'deptBitm', 'DeptBitm', 'DEPTBITM', 'deptBitv', 'DeptBitv', 'DEPTBITV']);

    return {
        timestamp,
        timestampMs: timestamp ? timestamp.getTime() : null,
        timestampLabel: formatDateTime(timestamp),
        depth,
        bitDepth: bitDepth === null ? depth : bitDepth,
        formationName: pick(raw, ['formationName', 'FormationName'], ''),
        activityCode: pick(raw, ['activityCode', 'ActivityCode'], ''),
        activityBucket: pick(raw, ['activityBucket', 'ActivityBucket'], ''),
        sampleIntervalSec: toNumber(pick(raw, ['sampleIntervalSec', 'SampleIntervalSec'], 0), 0),
        hasGapReset: Boolean(pick(raw, ['hasGapReset', 'HasGapReset'], false)),
        riskType: pick(raw, ['riskType', 'RiskType'], '正常'),
        severity,
        severityLevel: getSeverityMeta(severity).level,
        eventId: pick(raw, ['eventId', 'EventId'], ''),
        eventRecordId: pick(raw, ['eventRecordId', 'EventRecordId'], ''),
        isNewEvent: Boolean(pick(raw, ['isNewEvent', 'IsNewEvent'], false)),
        status: normalizeStatus(pick(raw, ['status', 'Status'], 'NEW')),
        advice: pick(raw, ['advice', 'Advice'], []) || [],
        evidence: (pick(raw, ['evidence', 'Evidence'], []) || []).map(normalizeEvidenceItem),
        metrics: {
            poolVolume: normalizeMetric(pick(metricsRaw, ['poolVolume', 'PoolVolume'], {}), 'poolVolume'),
            outletFlow: normalizeMetric(pick(metricsRaw, ['outletFlow', 'OutletFlow'], {}), 'outletFlow'),
            standpipePress: normalizeMetric(pick(metricsRaw, ['standpipePress', 'StandpipePress'], {}), 'standpipePress'),
            hookLoad: normalizeMetric(pick(metricsRaw, ['hookLoad', 'HookLoad'], {}), 'hookLoad'),
            torque: normalizeMetric(pick(metricsRaw, ['torque', 'Torque'], {}), 'torque'),
            rop: normalizeMetric(pick(metricsRaw, ['rop', 'Rop'], {}), 'rop'),
            pumpSpmTotal: normalizeMetric(pick(metricsRaw, ['pumpSpmTotal', 'PumpSpmTotal'], {}), 'pumpSpmTotal'),
            flowIn: normalizeMetric(pick(metricsRaw, ['flowIn', 'FlowIn'], {}), 'flowIn'),
            gas: normalizeMetric(pick(metricsRaw, ['gas', 'Gas'], {}), 'gas'),
            chokePressure: normalizeMetric(pick(metricsRaw, ['chokePressure', 'ChokePressure'], {}), 'chokePressure'),
            flowBalance: normalizeMetric(pick(metricsRaw, ['flowBalance', 'FlowBalance'], {}), 'flowBalance'),
            flowBalanceIntegral: normalizeMetric(pick(metricsRaw, ['flowBalanceIntegral', 'FlowBalanceIntegral'], {}), 'flowBalanceIntegral'),
            pitGain: normalizeMetric(pick(metricsRaw, ['pitGain', 'PitGain'], {}), 'pitGain')
        }
    };
}

export function normalizeSnapshot(raw) {
    const metricsRaw = pick(raw, ['metrics', 'Metrics'], {}) || {};
    const timestamp = toDate(pick(raw, ['timestamp', 'Timestamp'], null));
    const severity = normalizeSeverityCode(
        pick(raw, ['severity', 'Severity'], 'L0'),
        pick(raw, ['severityLevel', 'SeverityLevel'], 0)
    );
    const depth = pickDepthValue(raw, ['depth', 'Depth', 'deptMeas', 'DeptMeas', 'DEPTMEAS', 'deptVert', 'DeptVert', 'DEPTVERT']);
    const bitDepth = pickDepthValue(raw, ['bitDepth', 'BitDepth', 'deptBitm', 'DeptBitm', 'DEPTBITM', 'deptBitv', 'DeptBitv', 'DEPTBITV']);

    return {
        timestamp,
        timestampMs: timestamp ? timestamp.getTime() : null,
        timestampLabel: formatDateTime(timestamp),
        depth,
        bitDepth: bitDepth === null ? depth : bitDepth,
        formationName: pick(raw, ['formationName', 'FormationName'], ''),
        activityCode: pick(raw, ['activityCode', 'ActivityCode'], ''),
        activityBucket: pick(raw, ['activityBucket', 'ActivityBucket'], ''),
        riskType: pick(raw, ['riskType', 'RiskType'], '正常'),
        severity,
        severityLevel: getSeverityMeta(severity).level,
        advice: pick(raw, ['advice', 'Advice'], []) || [],
        evidence: (pick(raw, ['evidence', 'Evidence'], []) || []).map(normalizeEvidenceItem),
        metrics: {
            poolVolume: normalizeMetric(pick(metricsRaw, ['poolVolume', 'PoolVolume'], {}), 'poolVolume'),
            outletFlow: normalizeMetric(pick(metricsRaw, ['outletFlow', 'OutletFlow'], {}), 'outletFlow'),
            standpipePress: normalizeMetric(pick(metricsRaw, ['standpipePress', 'StandpipePress'], {}), 'standpipePress'),
            hookLoad: normalizeMetric(pick(metricsRaw, ['hookLoad', 'HookLoad'], {}), 'hookLoad'),
            torque: normalizeMetric(pick(metricsRaw, ['torque', 'Torque'], {}), 'torque'),
            rop: normalizeMetric(pick(metricsRaw, ['rop', 'Rop'], {}), 'rop'),
            pumpSpmTotal: normalizeMetric(pick(metricsRaw, ['pumpSpmTotal', 'PumpSpmTotal'], {}), 'pumpSpmTotal'),
            flowIn: normalizeMetric(pick(metricsRaw, ['flowIn', 'FlowIn'], {}), 'flowIn'),
            gas: normalizeMetric(pick(metricsRaw, ['gas', 'Gas'], {}), 'gas'),
            chokePressure: normalizeMetric(pick(metricsRaw, ['chokePressure', 'ChokePressure'], {}), 'chokePressure'),
            flowBalance: normalizeMetric(pick(metricsRaw, ['flowBalance', 'FlowBalance'], {}), 'flowBalance'),
            flowBalanceIntegral: normalizeMetric(pick(metricsRaw, ['flowBalanceIntegral', 'FlowBalanceIntegral'], {}), 'flowBalanceIntegral'),
            pitGain: normalizeMetric(pick(metricsRaw, ['pitGain', 'PitGain'], {}), 'pitGain')
        }
    };
}

export function normalizeEvent(raw) {
    const severity = normalizeSeverityCode(
        pick(raw, ['severity', 'Severity'], 'L0'),
        pick(raw, ['severityLevel', 'SeverityLevel'], 0)
    );
    const startTime = toDate(pick(raw, ['startTime', 'StartTime'], null));
    const endTime = toDate(pick(raw, ['endTime', 'EndTime'], null));

    return {
        recordId: pick(raw, ['recordId', 'RecordId'], ''),
        analysisRunId: pick(raw, ['analysisRunId', 'AnalysisRunId'], ''),
        configVersionId: pick(raw, ['configVersionId', 'ConfigVersionId'], ''),
        configVersion: normalizePtdProtocolVersionText(pick(raw, ['configVersion', 'ConfigVersion'], ''), ''),
        eventId: pick(raw, ['eventId', 'EventId'], ''),
        startTime,
        startTimeMs: startTime ? startTime.getTime() : null,
        startTimeLabel: formatDateTime(startTime),
        endTime,
        endTimeMs: endTime ? endTime.getTime() : null,
        endTimeLabel: formatDateTime(endTime),
        durationSec: toNumber(pick(raw, ['durationSec', 'DurationSec'], 0), 0),
        riskType: pick(raw, ['riskType', 'RiskType'], '正常'),
        severity,
        severityLevel: getSeverityMeta(severity).level,
        status: normalizeStatus(pick(raw, ['status', 'Status'], 'NEW')),
        isActive: Boolean(pick(raw, ['isActive', 'IsActive'], false)),
        evidence: (pick(raw, ['evidence', 'Evidence'], []) || []).map(normalizeEvidenceItem),
        advice: pick(raw, ['advice', 'Advice'], []) || [],
        snapshot: normalizeSnapshot(pick(raw, ['snapshot', 'Snapshot'], {}))
    };
}

export function normalizeSampling(raw) {
    return {
        sampleCount: toNumber(pick(raw, ['sampleCount', 'SampleCount'], 0), 0),
        averageIntervalSec: toNumber(pick(raw, ['averageIntervalSec', 'AverageIntervalSec'], 0), 0),
        medianIntervalSec: toNumber(pick(raw, ['medianIntervalSec', 'MedianIntervalSec'], 0), 0),
        maxIntervalSec: toNumber(pick(raw, ['maxIntervalSec', 'MaxIntervalSec'], 0), 0),
        minIntervalSec: toNumber(pick(raw, ['minIntervalSec', 'MinIntervalSec'], 0), 0),
        dominantIntervalSec: toNumber(pick(raw, ['dominantIntervalSec', 'DominantIntervalSec'], 0), 0)
    };
}

function normalizeMetricWindowConfig(raw, fallback = {}) {
    return {
        shortWindowSec: toNumber(pick(raw, ['shortWindowSec', 'ShortWindowSec'], fallback.shortWindowSec), fallback.shortWindowSec || 0),
        longWindowSec: toNumber(pick(raw, ['longWindowSec', 'LongWindowSec'], fallback.longWindowSec), fallback.longWindowSec || 0),
        madWindowSec: toNumber(pick(raw, ['madWindowSec', 'MadWindowSec'], fallback.madWindowSec), fallback.madWindowSec || 0),
        kFactor: toNumber(pick(raw, ['kFactor', 'KFactor'], fallback.kFactor), fallback.kFactor || 0)
    };
}

function normalizeSoftDampingConfig(raw, fallback = {}) {
    return {
        enabled: toBoolean(pick(raw, ['enabled', 'Enabled'], fallback.enabled), Boolean(fallback.enabled)),
        activityTransitionFactor: toNumber(pick(raw, ['activityTransitionFactor', 'ActivityTransitionFactor'], fallback.activityTransitionFactor), fallback.activityTransitionFactor || 0)
    };
}

function normalizeDynamicThresholdConfig(raw, fallback = {}) {
    return {
        enabled: toBoolean(pick(raw, ['enabled', 'Enabled'], fallback.enabled), Boolean(fallback.enabled)),
        halfLifeRatio: toNumber(pick(raw, ['halfLifeRatio', 'HalfLifeRatio'], fallback.halfLifeRatio), fallback.halfLifeRatio || 0),
        stableKFactor: toNumber(pick(raw, ['stableKFactor', 'StableKFactor'], fallback.stableKFactor), fallback.stableKFactor || 0),
        volatileKFactor: toNumber(pick(raw, ['volatileKFactor', 'VolatileKFactor'], fallback.volatileKFactor), fallback.volatileKFactor || 0),
        volatilitySwitchRatio: toNumber(pick(raw, ['volatilitySwitchRatio', 'VolatilitySwitchRatio'], fallback.volatilitySwitchRatio), fallback.volatilitySwitchRatio || 0),
        huberC: toNumber(pick(raw, ['huberC', 'HuberC'], fallback.huberC), fallback.huberC || 0),
        huberIterations: toNumber(pick(raw, ['huberIterations', 'HuberIterations'], fallback.huberIterations), fallback.huberIterations || 0),
        wellSectionFactor: toNumber(pick(raw, ['wellSectionFactor', 'WellSectionFactor'], fallback.wellSectionFactor), fallback.wellSectionFactor || 0)
    };
}

function normalizeAbsoluteThresholdsConfig(raw, fallback = {}) {
    return {
        enableSppDropFallback: toBoolean(pick(raw, ['enableSppDropFallback', 'EnableSppDropFallback'], fallback.enableSppDropFallback), Boolean(fallback.enableSppDropFallback)),
        sppBaselineMinMpa: toNumber(pick(raw, ['sppBaselineMinMpa', 'SppBaselineMinMpa'], fallback.sppBaselineMinMpa), fallback.sppBaselineMinMpa || 0),
        sppAbsoluteDropMpa: toNumber(pick(raw, ['sppAbsoluteDropMpa', 'SppAbsoluteDropMpa'], fallback.sppAbsoluteDropMpa), fallback.sppAbsoluteDropMpa || 0),
        enablePitGainFallback: toBoolean(pick(raw, ['enablePitGainFallback', 'EnablePitGainFallback'], fallback.enablePitGainFallback), Boolean(fallback.enablePitGainFallback)),
        pitGainAbsoluteThresholdM3: toNumber(pick(raw, ['pitGainAbsoluteThresholdM3', 'PitGainAbsoluteThresholdM3'], fallback.pitGainAbsoluteThresholdM3), fallback.pitGainAbsoluteThresholdM3 || 0)
    };
}

function normalizeMotorDrillingConfig(raw, fallback = {}) {
    return {
        enabled: toBoolean(pick(raw, ['enabled', 'Enabled'], fallback.enabled), Boolean(fallback.enabled)),
        maxRpm: toNumber(pick(raw, ['maxRpm', 'MaxRpm'], fallback.maxRpm), fallback.maxRpm || 0),
        minPumpSpmTotal: toNumber(pick(raw, ['minPumpSpmTotal', 'MinPumpSpmTotal'], fallback.minPumpSpmTotal), fallback.minPumpSpmTotal || 0)
    };
}

function normalizePrcdConfig(raw, fallback = {}) {
    return {
        enabled: toBoolean(pick(raw, ['enabled', 'Enabled'], fallback.enabled), Boolean(fallback.enabled)),
        rateSmoothPoints: toNumber(pick(raw, ['rateSmoothPoints', 'RateSmoothPoints'], fallback.rateSmoothPoints), fallback.rateSmoothPoints || 0),
        localSlopePointCount: toNumber(pick(raw, ['localSlopePointCount', 'LocalSlopePointCount'], fallback.localSlopePointCount), fallback.localSlopePointCount || 0),
        robustIterations: toNumber(pick(raw, ['robustIterations', 'RobustIterations'], fallback.robustIterations), fallback.robustIterations || 0),
        huberC: toNumber(pick(raw, ['huberC', 'HuberC'], fallback.huberC), fallback.huberC || 0),
        shortAlpha: toNumber(pick(raw, ['shortAlpha', 'ShortAlpha'], fallback.shortAlpha), fallback.shortAlpha || 0),
        longAlpha: toNumber(pick(raw, ['longAlpha', 'LongAlpha'], fallback.longAlpha), fallback.longAlpha || 0),
        crossSuppressFactor: toNumber(pick(raw, ['crossSuppressFactor', 'CrossSuppressFactor'], fallback.crossSuppressFactor), fallback.crossSuppressFactor || 0)
    };
}

function normalizePreprocessingConfig(raw, fallback = {}) {
    return {
        enableAdvancedPipeline: true,
        enableGrubbsFilter: toBoolean(pick(raw, ['enableGrubbsFilter', 'EnableGrubbsFilter'], fallback.enableGrubbsFilter), Boolean(fallback.enableGrubbsFilter)),
        enableDetrending: toBoolean(pick(raw, ['enableDetrending', 'EnableDetrending'], fallback.enableDetrending), Boolean(fallback.enableDetrending)),
        enableWaveletDenoise: false,
        enableFrequencyFilter: false,
        grubbsSigmaThreshold: toNumber(pick(raw, ['grubbsSigmaThreshold', 'GrubbsSigmaThreshold'], fallback.grubbsSigmaThreshold), fallback.grubbsSigmaThreshold || 0),
        waveletLevels: toNumber(pick(raw, ['waveletLevels', 'WaveletLevels'], fallback.waveletLevels), fallback.waveletLevels || 0),
        maxPeriodicComponents: toNumber(pick(raw, ['maxPeriodicComponents', 'MaxPeriodicComponents'], fallback.maxPeriodicComponents), fallback.maxPeriodicComponents || 0),
        periodicAmplitudeRatio: toNumber(pick(raw, ['periodicAmplitudeRatio', 'PeriodicAmplitudeRatio'], fallback.periodicAmplitudeRatio), fallback.periodicAmplitudeRatio || 0),
        adaptiveMinRatio: toNumber(pick(raw, ['adaptiveMinRatio', 'AdaptiveMinRatio'], fallback.adaptiveMinRatio), fallback.adaptiveMinRatio || 0),
        adaptiveMaxRatio: toNumber(pick(raw, ['adaptiveMaxRatio', 'AdaptiveMaxRatio'], fallback.adaptiveMaxRatio), fallback.adaptiveMaxRatio || 0),
        entropyStepSec: toNumber(pick(raw, ['entropyStepSec', 'EntropyStepSec'], fallback.entropyStepSec), fallback.entropyStepSec || 0),
        gradientStep: toNumber(pick(raw, ['gradientStep', 'GradientStep'], fallback.gradientStep), fallback.gradientStep || 0),
        entropyBins: toNumber(pick(raw, ['entropyBins', 'EntropyBins'], fallback.entropyBins), fallback.entropyBins || 0)
    };
}

function pickDepthValue(raw, keys) {
    return toNumber(pick(raw, keys, null), null);
}

export function normalizeUnifiedConfig(raw) {
    const source = raw || {};
    const defaults = DEFAULT_PTD_CONFIG;
    return {
        version: normalizePtdProtocolVersionText(pick(source, ['version', 'Version'], defaults.version), defaults.version),
        effectiveAt: toDate(pick(source, ['effectiveAt', 'EffectiveAt'], defaults.effectiveAt)),
        approvedBy: pick(source, ['approvedBy', 'ApprovedBy'], defaults.approvedBy),
        remark: pick(source, ['remark', 'Remark'], defaults.remark),
        warmupWindowSec: toNumber(pick(source, ['warmupWindowSec', 'WarmupWindowSec'], defaults.warmupWindowSec), defaults.warmupWindowSec),
        stablePumpWindowSec: toNumber(pick(source, ['stablePumpWindowSec', 'StablePumpWindowSec'], defaults.stablePumpWindowSec), defaults.stablePumpWindowSec),
        stableVariationRatio: toNumber(pick(source, ['stableVariationRatio', 'StableVariationRatio'], defaults.stableVariationRatio), defaults.stableVariationRatio),
        flowFactorWindowSec: toNumber(pick(source, ['flowFactorWindowSec', 'FlowFactorWindowSec'], defaults.flowFactorWindowSec), defaults.flowFactorWindowSec),
        flowFactorClampRatio: toNumber(pick(source, ['flowFactorClampRatio', 'FlowFactorClampRatio'], defaults.flowFactorClampRatio), defaults.flowFactorClampRatio),
        eventCooldownSec: toNumber(pick(source, ['eventCooldownSec', 'EventCooldownSec'], defaults.eventCooldownSec), defaults.eventCooldownSec),
        gapResetFloorSec: toNumber(pick(source, ['gapResetFloorSec', 'GapResetFloorSec'], defaults.gapResetFloorSec), defaults.gapResetFloorSec),
        gapResetMultiplier: toNumber(pick(source, ['gapResetMultiplier', 'GapResetMultiplier'], defaults.gapResetMultiplier), defaults.gapResetMultiplier),
        l1MinDurationSec: toNumber(pick(source, ['l1MinDurationSec', 'L1MinDurationSec'], defaults.l1MinDurationSec), defaults.l1MinDurationSec),
        l2MinDurationSec: toNumber(pick(source, ['l2MinDurationSec', 'L2MinDurationSec'], defaults.l2MinDurationSec), defaults.l2MinDurationSec),
        l3MinDurationSec: toNumber(pick(source, ['l3MinDurationSec', 'L3MinDurationSec'], defaults.l3MinDurationSec), defaults.l3MinDurationSec),
        softDamping: normalizeSoftDampingConfig(pick(source, ['softDamping', 'SoftDamping'], {}), defaults.softDamping),
        dynamicThreshold: normalizeDynamicThresholdConfig(pick(source, ['dynamicThreshold', 'DynamicThreshold'], {}), defaults.dynamicThreshold),
        absoluteThresholds: normalizeAbsoluteThresholdsConfig(pick(source, ['absoluteThresholds', 'AbsoluteThresholds'], {}), defaults.absoluteThresholds),
        motorDrilling: normalizeMotorDrillingConfig(pick(source, ['motorDrilling', 'MotorDrilling'], {}), defaults.motorDrilling),
        prcd: normalizePrcdConfig(pick(source, ['prcd', 'Prcd'], {}), defaults.prcd),
        preprocessing: normalizePreprocessingConfig(pick(source, ['preprocessing', 'Preprocessing'], {}), defaults.preprocessing),
        outletFlow: normalizeMetricWindowConfig(pick(source, ['outletFlow', 'OutletFlow'], {}), defaults.outletFlow),
        standpipePress: normalizeMetricWindowConfig(pick(source, ['standpipePress', 'StandpipePress'], {}), defaults.standpipePress),
        poolVolume: normalizeMetricWindowConfig(pick(source, ['poolVolume', 'PoolVolume'], {}), defaults.poolVolume),
        mechanical: normalizeMetricWindowConfig(pick(source, ['mechanical', 'Mechanical'], {}), defaults.mechanical),
        gas: normalizeMetricWindowConfig(pick(source, ['gas', 'Gas'], {}), defaults.gas),
        chokePressure: normalizeMetricWindowConfig(pick(source, ['chokePressure', 'ChokePressure'], {}), defaults.chokePressure),
        flowBalance: normalizeMetricWindowConfig(pick(source, ['flowBalance', 'FlowBalance'], {}), defaults.flowBalance),
        flowBalanceIntegral: normalizeMetricWindowConfig(pick(source, ['flowBalanceIntegral', 'FlowBalanceIntegral'], {}), defaults.flowBalanceIntegral),
        pitGain: normalizeMetricWindowConfig(pick(source, ['pitGain', 'PitGain'], {}), defaults.pitGain)
    };
}

export function normalizeHistoryResponse(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    const frames = (pick(body, ['frames', 'Frames'], []) || [])
        .map(normalizeFrame)
        .filter(item => item.timestampMs !== null);
    const events = (pick(body, ['events', 'Events'], []) || [])
        .map(normalizeEvent)
        .filter(item => item.startTimeMs !== null && item.endTimeMs !== null);

    return {
        sampling: normalizeSampling(pick(body, ['sampling', 'Sampling'], {})),
        frames,
        events,
        analysisRunId: pick(body, ['analysisRunId', 'AnalysisRunId'], ''),
        configVersionId: pick(body, ['configVersionId', 'ConfigVersionId'], ''),
        configVersion: normalizePtdProtocolVersionText(pick(body, ['configVersion', 'ConfigVersion'], ''), ''),
        config: normalizeUnifiedConfig(pick(body, ['config', 'Config'], {}))
    };
}

export function normalizeRealtimeDelivery(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    return {
        analysisRunId: pick(body, ['analysisRunId', 'AnalysisRunId'], ''),
        configVersionId: pick(body, ['configVersionId', 'ConfigVersionId'], ''),
        configVersion: normalizePtdProtocolVersionText(pick(body, ['configVersion', 'ConfigVersion'], ''), ''),
        frame: normalizeFrame(pick(body, ['frame', 'Frame'], {})),
        events: (pick(body, ['events', 'Events'], []) || []).map(normalizeEvent),
        sampling: normalizeSampling(pick(body, ['sampling', 'Sampling'], {}))
    };
}

function normalizeVersionSummary(raw) {
    return {
        configVersionId: pick(raw, ['configVersionId', 'ConfigVersionId'], ''),
        wellId: pick(raw, ['wellId', 'WellId'], ''),
        versionNo: toNumber(pick(raw, ['versionNo', 'VersionNo'], 0), 0),
        versionCode: normalizePtdProtocolVersionText(pick(raw, ['versionCode', 'VersionCode'], ''), ''),
        versionName: normalizePtdProtocolVersionText(pick(raw, ['versionName', 'VersionName'], ''), ''),
        isActive: Boolean(pick(raw, ['isActive', 'IsActive'], false)),
        sourceWellId: pick(raw, ['sourceWellId', 'SourceWellId'], ''),
        sourceConfigVersionId: pick(raw, ['sourceConfigVersionId', 'SourceConfigVersionId'], ''),
        sourceVersionCode: normalizePtdProtocolVersionText(pick(raw, ['sourceVersionCode', 'SourceVersionCode'], ''), ''),
        remark: pick(raw, ['remark', 'Remark'], ''),
        createdBy: pick(raw, ['createdBy', 'CreatedBy'], ''),
        createdAt: toDate(pick(raw, ['createdAt', 'CreatedAt'], null)),
        createdAtLabel: formatDateTime(pick(raw, ['createdAt', 'CreatedAt'], null)),
        updatedAt: toDate(pick(raw, ['updatedAt', 'UpdatedAt'], null)),
        updatedAtLabel: formatDateTime(pick(raw, ['updatedAt', 'UpdatedAt'], null))
    };
}

export function normalizeConfigDetail(raw) {
    return {
        ...normalizeVersionSummary(raw),
        isDefaultConfig: Boolean(pick(raw, ['isDefaultConfig', 'IsDefaultConfig'], false)),
        config: normalizeUnifiedConfig(pick(raw, ['config', 'Config'], {}))
    };
}

export function normalizeConfigEditorResponse(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    return {
        currentWellId: pick(body, ['currentWellId', 'CurrentWellId'], ''),
        selectedConfigVersionId: pick(body, ['selectedConfigVersionId', 'SelectedConfigVersionId'], ''),
        currentConfig: normalizeConfigDetail(pick(body, ['currentConfig', 'CurrentConfig'], {})),
        versions: (pick(body, ['versions', 'Versions'], []) || []).map(normalizeVersionSummary),
        cloneableWellIds: (pick(body, ['cloneableWellIds', 'CloneableWellIds'], []) || []).slice()
    };
}

export function normalizeConfigActivationResponse(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    return {
        config: normalizeConfigDetail(pick(body, ['config', 'Config'], {})),
        activeRealtimeSessionCount: toNumber(pick(body, ['activeRealtimeSessionCount', 'ActiveRealtimeSessionCount'], 0), 0),
        restartedRealtimeSessionCount: toNumber(pick(body, ['restartedRealtimeSessionCount', 'RestartedRealtimeSessionCount'], 0), 0),
        restartRealtimeSessions: Boolean(pick(body, ['restartRealtimeSessions', 'RestartRealtimeSessions'], false))
    };
}

export function normalizeRealtimeRuntimeStatus(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    const sessions = (pick(body, ['sessions', 'Sessions'], []) || []).map(item => ({
        connectionId: pick(item, ['connectionId', 'ConnectionId'], ''),
        wellId: pick(item, ['wellId', 'WellId'], ''),
        configVersionId: pick(item, ['configVersionId', 'ConfigVersionId'], ''),
        configVersionCode: normalizePtdProtocolVersionText(pick(item, ['configVersionCode', 'ConfigVersionCode'], ''), ''),
        startedAt: toDate(pick(item, ['startedAt', 'StartedAt'], null)),
        startedAtLabel: formatDateTime(pick(item, ['startedAt', 'StartedAt'], null))
    }));

    return {
        wellId: pick(body, ['wellId', 'WellId'], ''),
        hasActiveRealtimeSessions: Boolean(pick(body, ['hasActiveRealtimeSessions', 'HasActiveRealtimeSessions'], false)),
        activeSessionCount: toNumber(pick(body, ['activeSessionCount', 'ActiveSessionCount'], sessions.length), sessions.length),
        sessions
    };
}

export function normalizeEventDetailResponse(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    return {
        event: normalizeEvent(pick(body, ['event', 'Event'], {})),
        actionLogs: (pick(body, ['actionLogs', 'ActionLogs'], []) || []).map(item => ({
            actionLogId: pick(item, ['actionLogId', 'ActionLogId'], ''),
            eventRecordId: pick(item, ['eventRecordId', 'EventRecordId'], ''),
            eventId: pick(item, ['eventId', 'EventId'], ''),
            actionType: pick(item, ['actionType', 'ActionType'], ''),
            beforeStatus: normalizeStatus(pick(item, ['beforeStatus', 'BeforeStatus'], 'NEW')),
            afterStatus: normalizeStatus(pick(item, ['afterStatus', 'AfterStatus'], 'NEW')),
            remark: pick(item, ['remark', 'Remark'], ''),
            operator: pick(item, ['operator', 'Operator'], ''),
            actionTime: toDate(pick(item, ['actionTime', 'ActionTime'], null)),
            actionTimeLabel: formatDateTime(pick(item, ['actionTime', 'ActionTime'], null))
        }))
    };
}

export function normalizeEventChartResponse(payload) {
    const body = pick(payload, ['data', 'Data'], payload) || {};
    const frames = (pick(body, ['frames', 'Frames'], []) || [])
        .map(normalizeFrame)
        .filter(item => item.timestampMs !== null);

    return {
        sampling: normalizeSampling(pick(body, ['sampling', 'Sampling'], {})),
        frames,
        configVersionId: pick(body, ['configVersionId', 'ConfigVersionId'], ''),
        configVersion: normalizePtdProtocolVersionText(pick(body, ['configVersion', 'ConfigVersion'], ''), ''),
        startTime: toDate(pick(body, ['startTime', 'StartTime'], null)),
        endTime: toDate(pick(body, ['endTime', 'EndTime'], null))
    };
}

export function computeSamplingFromFrames(frames) {
    const values = (frames || [])
        .map(item => toNumber(item.sampleIntervalSec, null))
        .filter(item => item !== null && item > 0);

    if (!values.length) {
        return normalizeSampling({});
    }

    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];

    const counter = {};
    values.forEach((value) => {
        const key = value.toFixed(3);
        counter[key] = (counter[key] || 0) + 1;
    });

    const dominant = Object.keys(counter)
        .sort((a, b) => {
            if (counter[b] !== counter[a]) {
                return counter[b] - counter[a];
            }
            return Number(a) - Number(b);
        })[0];

    return {
        sampleCount: values.length,
        averageIntervalSec: Number((values.reduce((sum, item) => sum + item, 0) / values.length).toFixed(3)),
        medianIntervalSec: Number(median.toFixed(3)),
        maxIntervalSec: Number(Math.max(...values).toFixed(3)),
        minIntervalSec: Number(Math.min(...values).toFixed(3)),
        dominantIntervalSec: Number((dominant || 0))
    };
}

export function buildDefaultStartTime(startTimeText) {
    const date = toDate(startTimeText);
    return formatDateTime(date === null ? new Date() : date);
}

export function buildDefaultTimeRange(startTimeText, hours = 3) {
    const start = toDate(startTimeText) || new Date();
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return [formatDateTime(start), formatDateTime(end)];
}

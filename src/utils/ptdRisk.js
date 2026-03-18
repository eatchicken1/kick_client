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
        upperThreshold: toNumber(pick(raw, ['upperThreshold', 'UpperThreshold'], null)),
        lowerThreshold: toNumber(pick(raw, ['lowerThreshold', 'LowerThreshold'], null)),
        isAnomaly: Boolean(pick(raw, ['isAnomaly', 'IsAnomaly'], false)),
        direction: normalizeDirection(pick(raw, ['direction', 'Direction'], 'NONE')),
        ratio: toNumber(pick(raw, ['ratio', 'Ratio'], null)),
        windowSeconds: toNumber(pick(raw, ['windowSeconds', 'WindowSeconds'], null)),
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

    return {
        timestamp,
        timestampMs: timestamp ? timestamp.getTime() : null,
        timestampLabel: formatDateTime(timestamp),
        depth: toNumber(pick(raw, ['depth', 'Depth'], null)),
        activityCode: pick(raw, ['activityCode', 'ActivityCode'], ''),
        activityBucket: pick(raw, ['activityBucket', 'ActivityBucket'], ''),
        sampleIntervalSec: toNumber(pick(raw, ['sampleIntervalSec', 'SampleIntervalSec'], 0), 0),
        hasGapReset: Boolean(pick(raw, ['hasGapReset', 'HasGapReset'], false)),
        riskType: pick(raw, ['riskType', 'RiskType'], '正常'),
        severity,
        severityLevel: getSeverityMeta(severity).level,
        eventId: pick(raw, ['eventId', 'EventId'], ''),
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

export function normalizeEvent(raw) {
    const severity = normalizeSeverityCode(
        pick(raw, ['severity', 'Severity'], 'L0'),
        pick(raw, ['severityLevel', 'SeverityLevel'], 0)
    );
    const startTime = toDate(pick(raw, ['startTime', 'StartTime'], null));
    const endTime = toDate(pick(raw, ['endTime', 'EndTime'], null));

    return {
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
        advice: pick(raw, ['advice', 'Advice'], []) || []
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
        configVersion: pick(body, ['configVersion', 'ConfigVersion'], ''),
        config: pick(body, ['config', 'Config'], {}) || {}
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

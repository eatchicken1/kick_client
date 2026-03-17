<template>
  <div class="anomaly-container" ref="container">
    <el-alert v-if="!currentWellId" type="warning" :closable="false" show-icon class="well-alert">
      请先在井眼选择中选择井号，再进行综合溢流异常检测。
    </el-alert>

    <el-card class="box-card search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="small">
        <el-form-item label="当前井号">
          <el-tag type="info" size="medium" effect="dark">{{ currentWellId || '未选择' }}</el-tag>
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
            :default-time="['00:00:00', '23:59:59']"
            style="width: 360px;">
          </el-date-picker>
        </el-form-item>

        <el-collapse class="ptd-collapse" accordion>
          <el-collapse-item title="⚙️ 高级算法参数 (PTD & 动态MAD)" name="ptd">
            <el-form-item label="短窗"><el-input v-model.number="searchForm.shortWindow" placeholder="默认 10" style="width: 100px;" type="number"/></el-form-item>
            <el-form-item label="长窗"><el-input v-model.number="searchForm.longWindow" placeholder="默认 100" style="width: 100px;" type="number"/></el-form-item>
            <el-form-item label="MAD 窗口"><el-input v-model.number="searchForm.madWindow" placeholder="默认 500" style="width: 100px;" type="number"/></el-form-item>
            <el-form-item label="K 系数"><el-input v-model.number="searchForm.kFactor" placeholder="默认 2.0" style="width: 100px;" type="number" step="0.1"/></el-form-item>
          </el-collapse-item>
        </el-collapse>

        <el-form-item style="margin-top: 10px;">
          <el-button type="primary" icon="el-icon-odometer" @click="fetchData" :loading="loading" :disabled="!currentWellId">
            启动大规模机理协同分析
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="15" class="dashboard-panel" v-if="hasData">
      <el-col :span="10">
        <div class="status-card" :class="globalStatus === 'danger' ? 'danger-bg' : 'safe-bg'">
          <div class="status-icon">
            <i :class="globalStatus === 'danger' ? 'el-icon-warning' : 'el-icon-success'"></i>
          </div>
          <div class="status-info" style="flex:1">
            <div class="status-title">系统综合诊断结论</div>
            <div class="status-text">{{ globalStatus === 'danger' ? '检测到高危溢流特征！' : '井筒压力平衡状态平稳' }}</div>
            <div class="diagnosis-tags" v-if="globalStatus === 'danger'">
              <el-tooltip class="item" effect="dark" content="点击查看底层触发机理风险树" placement="top" v-for="type in detectedWarningTypes" :key="type">
                <el-tag effect="dark" type="danger" class="clickable-tag" @click="openRuleTreeDialog(type)">
                  <i class="el-icon-s-operation"></i> {{ type }}
                </el-tag>
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never" class="stats-card">
          <div slot="header" class="clearfix">
            <span>📊 核心检测参数突破统计摘要</span>
          </div>
          <div class="stats-grid">
            <div class="stat-item"><span class="label">立压 (SPP):</span><span class="value" :class="{'text-danger': stats.sppAnomalies > 0}">{{ stats.sppAnomalies }} 点</span></div>
            <div class="stat-item"><span class="label">出口流量:</span><span class="value" :class="{'text-danger': stats.flowAnomalies > 0}">{{ stats.flowAnomalies }} 点</span></div>
            <div class="stat-item"><span class="label">总池体积:</span><span class="value" :class="{'text-danger': stats.volAnomalies > 0}">{{ stats.volAnomalies }} 点</span></div>
            <div class="stat-item"><span class="label">钻时 (ROP):</span><span class="value" :class="{'text-danger': stats.ropAnomalies > 0}">{{ stats.ropAnomalies }} 点</span></div>
            <div class="stat-item clickable-stat" @click="openIntervalDialog" title="点击查看详情并进行图表定位">
              <span class="label"><i class="el-icon-location-outline"></i> 溢流高危区间:</span>
              <span class="value text-danger" style="font-weight: bold; text-decoration: underline;">
                {{ stats.warningIntervals }} 个 <i class="el-icon-thumb" style="font-size:16px;"></i>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="chart-list" v-loading="loading" element-loading-text="正在进行LTTB高性能降采样及特征渲染..." element-loading-spinner="el-icon-loading" v-if="hasData">
      <div class="chart-item-large" ref="chartSpp"></div>
      <div class="chart-item-large" ref="chartFlow"></div>
      <div class="chart-item-large" ref="chartVolume"></div>
      <div class="chart-item-large" ref="chartHookLoad"></div>
      <div class="chart-item-large" ref="chartTorque"></div>
      <div class="chart-item-large" ref="chartRop"></div>
    </div>

    <el-dialog :title="`🔬 综合工况风险树溯源: [${activeRuleType}]`" :visible.sync="ruleDialogVisible" width="650px" custom-class="rule-dialog">
      <div class="logic-tree-container" v-if="activeRuleData">
        <div class="logic-result"><i class="el-icon-warning"></i> 诊断结论: <strong>{{ activeRuleType }}</strong></div>
        <div class="logic-line-vertical"></div>
        <div class="logic-gate">AND (需同时满足以下机理)</div>
        <div class="logic-line-vertical"></div>
        <div class="logic-branches">
          <div class="logic-branch" v-for="(cond, idx) in activeRuleData.conditions" :key="idx">
            <div class="param-box"><span class="param-icon">{{ cond.icon }}</span>{{ cond.name }}</div>
            <div class="logic-line-horizontal"></div>
            <div class="dir-box" :class="cond.dir">{{ cond.text }} <i :class="cond.dir === 'low' ? 'el-icon-bottom' : (cond.dir === 'high' ? 'el-icon-top' : 'el-icon-right')"></i></div>
          </div>
        </div>
        <div class="logic-explanation"><strong>📝 井下物理机理解析：</strong>{{ activeRuleData.desc }}</div>
      </div>
    </el-dialog>

    <el-dialog title="📋 溢流高危区间清单导航" :visible.sync="intervalDialogVisible" width="700px">
      <el-alert title="点击右侧【图表定位】按钮，页面将自动滚动并精准聚焦该时间段。" type="info" show-icon style="margin-bottom:15px;"></el-alert>
      <el-table :data="intervalList" border stripe size="small" height="350">
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="type" label="工况类型" width="140" align="center">
          <template slot-scope="scope">
            <el-tag type="danger" effect="dark" size="small">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start" label="起始时间" align="center"></el-table-column>
        <el-table-column prop="end" label="结束时间" align="center"></el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-aim" @click="jumpToChartTimeframe(scope.row)">图表定位</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import { getPtdEarlyWarningApi } from '@/api/index';
import * as echarts from 'echarts';

// 风险树知识库字典...
const RULE_KNOWLEDGE_BASE = {
  "溢流前兆(放空)": { desc: "钻遇地层裂缝或溶洞时，钻头突然失去反作用力，导致钻时、扭矩、立压骤降，钩载上升。", conditions: [ { name: "立压", icon: "⏱️", dir: "low", text: "突破下限" }, { name: "扭矩", icon: "⚙️", dir: "low", text: "突破下限" }, { name: "钻时", icon: "⛏️", dir: "low", text: "突破下限" }, { name: "钩载", icon: "🏗️", dir: "high", text: "突破上限" } ] },
  "气侵溢流": { desc: "地层流体侵入井筒导致液柱密度降低，因流体膨胀导致出口流量与泥浆池体积增加。", conditions: [ { name: "立压", icon: "⏱️", dir: "low", text: "突破下限" }, { name: "出口流量", icon: "🌊", dir: "high", text: "突破上限" }, { name: "总池体积", icon: "🛢️", dir: "high", text: "突破上限" } ] },
  "后期溢流": { desc: "井筒内流体压力已建立新平衡，立压不再下降但出口流量和池体积仍在增加。", conditions: [ { name: "立压", icon: "⏱️", dir: "none", text: "保持稳定" }, { name: "出口流量", icon: "🌊", dir: "high", text: "突破上限" }, { name: "总池体积", icon: "🛢️", dir: "high", text: "突破上限" } ] }
};

export default {
  name: 'ComprehensiveAnomaly',
  data() {
    return {
      loading: false, hasData: false,
      searchForm: { timeRange: ['2024-10-01 00:00:00', '2024-10-01 03:00:00'], shortWindow: null, longWindow: null, madWindow: null, kFactor: null },
      globalStatus: 'safe',
      detectedWarningTypes: [], 
      stats: { sppAnomalies: 0, flowAnomalies: 0, volAnomalies: 0, ropAnomalies: 0, warningIntervals: 0 },
      chartInstances: [],
      chartData: {
        times: [], spp: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] }, flow: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        volume: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] }, hookLoad: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        torque: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] }, rop: { orig: [], ptd: [], upper: [], lower: [], anomalies: [] },
        kickWarningAreas: []
      },
      resizeObserver: null,
      
      // 弹窗状态
      ruleDialogVisible: false, activeRuleType: '', activeRuleData: null,
      intervalDialogVisible: false, intervalList: [] // 导航清单
    };
  },
  computed: { currentWellId() { return this.$store.state.jh || ''; } },
  mounted() {
    if (this.$store.state.StartTime) {
      try {
        const startStr = this.$store.state.StartTime.replace(/\//g, '-');
        const startDate = new Date(startStr);
        const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
        const fmt = (d) => {
          const pad = n => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };
        this.searchForm.timeRange = [fmt(startDate), fmt(endDate)];
      } catch (e) {}
    }
    this.resizeObserver = new ResizeObserver(() => { requestAnimationFrame(() => { this.chartInstances.forEach(chart => chart.resize()); }); });
    if (this.$refs.container) this.resizeObserver.observe(this.$refs.container);
  },
  beforeDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.chartInstances.forEach(chart => chart.dispose());
  },
  methods: {
    openRuleTreeDialog(type) { this.activeRuleType = type; this.activeRuleData = RULE_KNOWLEDGE_BASE[type] || null; this.ruleDialogVisible = true; },
    openIntervalDialog() { if(this.intervalList.length > 0) this.intervalDialogVisible = true; },
    isValidNumber(v) { return v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v)); },
    
    // 🌟核心方法：将图表自动缩放定位到目标区间，并带上下文缓冲
    jumpToChartTimeframe(row) {
      this.intervalDialogVisible = false;
      const startIndex = this.chartData.times.indexOf(row.start);
      const endIndex = this.chartData.times.indexOf(row.end);
      if (startIndex === -1 || endIndex === -1) return;

      // 为避免定位太死板，前后各增加约 3 分钟的 padding (假设 1 秒 1 点，3分钟约 180 点，此处用时间戳精准计算)
      const startTS = new Date(row.start.replace(/-/g, '/')).getTime();
      const endTS = new Date(row.end.replace(/-/g, '/')).getTime();
      const paddingTS = 3 * 60 * 1000; // 3分钟缓冲期

      let targetStartStr = row.start;
      let targetEndStr = row.end;

      // 寻找缓冲起始点
      for (let i = startIndex; i >= 0; i--) {
        if (new Date(this.chartData.times[i].replace(/-/g, '/')).getTime() <= startTS - paddingTS) { targetStartStr = this.chartData.times[i]; break; }
        if (i === 0) targetStartStr = this.chartData.times[0];
      }
      // 寻找缓冲结束点
      for (let i = endIndex; i < this.chartData.times.length; i++) {
        if (new Date(this.chartData.times[i].replace(/-/g, '/')).getTime() >= endTS + paddingTS) { targetEndStr = this.chartData.times[i]; break; }
        if (i === this.chartData.times.length - 1) targetEndStr = this.chartData.times[i];
      }

      // 通过 dispatchAction 让所有联动的 ECharts 瞬间缩放至目标位置
      this.chartInstances.forEach(chart => {
        chart.dispatchAction({
          type: 'dataZoom',
          startValue: targetStartStr,
          endValue: targetEndStr
        });
      });

      // 页面自动滚动到顶部第一个图表位置，确保用户马上能看到
      if (this.$refs.container) this.$refs.container.scrollIntoView({ behavior: 'smooth' });
      this.$message.success(`已精准定位至 ${row.start} 发生的 [${row.type}]，并自动展开上下文`);
    },

    async fetchData() {
      if (!this.currentWellId) return this.$message.warning('请先选择井号');
      if (!this.searchForm.timeRange || this.searchForm.timeRange.length < 2) return this.$message.warning('请选择时间范围');

      const params = { wellId: this.currentWellId, startTime: this.searchForm.timeRange[0].replace(' ', 'T'), endTime: this.searchForm.timeRange[1].replace(' ', 'T') };
      if (this.isValidNumber(this.searchForm.shortWindow)) params.shortWindow = this.searchForm.shortWindow;
      if (this.isValidNumber(this.searchForm.longWindow)) params.longWindow = this.searchForm.longWindow;
      if (this.isValidNumber(this.searchForm.madWindow)) params.madWindow = this.searchForm.madWindow;
      if (this.isValidNumber(this.searchForm.kFactor)) params.kFactor = this.searchForm.kFactor;

      this.loading = true; this.hasData = false;
      this.$nextTick(async () => {
        try {
          const res = await getPtdEarlyWarningApi(params);
          if (res && res.success && res.data && res.data.length > 0) {
            this.hasData = true;
            this.processChartData(res.data);
            this.$nextTick(() => { this.renderAllCharts(); this.$message.success('多维算法分析完成'); });
          } else { this.$message.info('未查询到数据'); this.clearCharts(); }
        } catch (error) { this.$message.error('数据处理异常'); this.clearCharts(); } 
        finally { this.loading = false; }
      });
    },

    processChartData(data) {
      const resetParam = () => ({ orig: [], ptd: [], upper: [], lower: [], anomalies: [] });
      this.chartData = { times: [], spp: resetParam(), flow: resetParam(), volume: resetParam(), hookLoad: resetParam(), torque: resetParam(), rop: resetParam(), kickWarningAreas: [] };
      this.intervalList = []; // 初始化导航清单

      let currentWarningType = null, warningStart = null;
      let globalDangerCount = 0, sppErr = 0, flowErr = 0, volErr = 0, ropErr = 0;
      let typeSet = new Set();

      const extract = (paramKey, itemData, index, isSpp, isFlow, isVol, isRop) => {
        this.chartData[paramKey].orig.push(itemData.originalValue);
        this.chartData[paramKey].ptd.push(itemData.ptdValue);
        this.chartData[paramKey].upper.push(itemData.upperThreshold);
        this.chartData[paramKey].lower.push(itemData.lowerThreshold);
        if (itemData.isAnomaly) {
          this.chartData[paramKey].anomalies.push([index, itemData.ptdValue]);
          if (isSpp) sppErr++; if (isFlow) flowErr++; if (isVol) volErr++; if (isRop) ropErr++;
        }
      };

      // 提取区间辅助方法
      const pushArea = (start, end, type) => {
        this.chartData.kickWarningAreas.push([{ xAxis: start, name: type }, { xAxis: end }]);
        this.intervalList.push({ start: start, end: end, type: type });
        globalDangerCount++;
      };

      data.forEach((item, index) => {
        const time = item.logTime.replace('T', ' '); this.chartData.times.push(time);
        extract('spp', item.spp, index, true, false, false, false);
        extract('flow', item.outletFlow, index, false, true, false, false);
        extract('volume', item.poolVolume, index, false, false, true, false);
        extract('hookLoad', item.hookLoad, index, false, false, false, false);
        extract('torque', item.torque, index, false, false, false, false);
        extract('rop', item.rop, index, false, false, false, true);

        if (item.isKickWarning) {
          typeSet.add(item.warningType); 
          if (currentWarningType !== item.warningType) {
            if (currentWarningType !== null) pushArea(warningStart, time, currentWarningType);
            currentWarningType = item.warningType; warningStart = time;
          }
        } else {
          if (currentWarningType !== null) {
            pushArea(warningStart, data[index - 1].logTime.replace('T', ' '), currentWarningType);
            currentWarningType = null;
          }
        }
      });
      if (currentWarningType !== null) pushArea(warningStart, data[data.length - 1].logTime.replace('T', ' '), currentWarningType);

      this.globalStatus = globalDangerCount > 0 ? 'danger' : 'safe';
      this.detectedWarningTypes = Array.from(typeSet);
      this.stats = { sppAnomalies: sppErr, flowAnomalies: flowErr, volAnomalies: volErr, ropAnomalies: ropErr, warningIntervals: globalDangerCount };
    },

    renderAllCharts() {
      this.chartInstances.forEach(chart => chart.dispose());
      this.chartInstances = [];

      const { times, kickWarningAreas } = this.chartData;
      
      // 🌟核心：默认寻找最后30分钟区间作为初始缩放范围
      let initialZoomStart = times[0];
      let initialZoomEnd = times[times.length - 1];
      if (times.length > 0) {
        const endTS = new Date(initialZoomEnd.replace(/-/g, '/')).getTime();
        const targetStartTS = endTS - 30 * 60 * 1000; // 30分钟前
        for (let i = times.length - 1; i >= 0; i--) {
          if (new Date(times[i].replace(/-/g, '/')).getTime() <= targetStartTS) { initialZoomStart = times[i]; break; }
        }
      }
      
      const kickMarkArea = { 
        itemStyle: { color: 'rgba(255, 77, 79, 0.12)' }, 
        label: { 
          show: true, position: 'insideTop', color: '#c0392b', fontWeight: 'bold', 
          backgroundColor: 'rgba(255,255,255,0.85)', padding: [4, 6], borderRadius: 4,
          // 彻底解决拥挤：标签只在顶部居中展示，并利用外边距防重叠
          offset: [0, 10]
        }, 
        data: kickWarningAreas 
      };

      this.initChart(this.$refs.chartSpp, '立压 SPP (MPa)', '#1890ff', times, this.chartData.spp, kickMarkArea, initialZoomStart, initialZoomEnd, false);
      this.initChart(this.$refs.chartFlow, '出口流量 Flow (%)', '#13c2c2', times, this.chartData.flow, kickMarkArea, initialZoomStart, initialZoomEnd, false);
      this.initChart(this.$refs.chartVolume, '总池体积 Volume (m³)', '#52c41a', times, this.chartData.volume, kickMarkArea, initialZoomStart, initialZoomEnd, false);
      this.initChart(this.$refs.chartHookLoad, '钩载 HKLA (kN)', '#faad14', times, this.chartData.hookLoad, kickMarkArea, initialZoomStart, initialZoomEnd, false);
      this.initChart(this.$refs.chartTorque, '扭矩 Torque (kN.m)', '#f5222d', times, this.chartData.torque, kickMarkArea, initialZoomStart, initialZoomEnd, false);
      this.initChart(this.$refs.chartRop, '钻时 ROP (min/m)', '#722ed1', times, this.chartData.rop, kickMarkArea, initialZoomStart, initialZoomEnd, true);

      echarts.connect(this.chartInstances);
    },

    initChart(domRef, title, origColor, xData, dataset, markArea, initialZoomStart, initialZoomEnd, isInverse = false) {
      if (!domRef) return;
      const chart = echarts.init(domRef);
      const option = {
        title: { text: title, left: 15, top: 15, textStyle: { fontSize: 14, color: '#333' } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['原始值', 'PTD偏离', 'MAD上限', 'MAD下限'], top: 15, right: 20 },
        grid: { left: '60px', right: '60px', bottom: '45px', top: '75px' }, 
        // 🌟核心：赋予初始缩放区间，告别加载即拥挤
        dataZoom: [
          { type: 'inside', xAxisIndex: 0, filterMode: 'filter', startValue: initialZoomStart, endValue: initialZoomEnd },
          { type: 'slider', xAxisIndex: 0, height: 15, bottom: 5, startValue: initialZoomStart, endValue: initialZoomEnd }
        ],
        xAxis: { type: 'category', data: xData, boundaryGap: false, axisLabel: { formatter: (val) => val.split(' ')[1] } },
        yAxis: [
          { type: 'value', name: '原始值', scale: true, inverse: isInverse, axisLabel: { color: origColor }, splitLine: { show: false } },
          { type: 'value', name: 'PTD基线', scale: true, position: 'right', axisLabel: { color: '#eab308' }, splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } }
        ],
        series: [
          { name: '原始值', type: 'line', yAxisIndex: 0, data: dataset.orig, sampling: 'lttb', showSymbol: false, itemStyle: { color: origColor }, lineStyle: { width: 2 }, markArea: markArea },
          { name: 'PTD偏离', type: 'line', yAxisIndex: 1, data: dataset.ptd, sampling: 'lttb', showSymbol: false, itemStyle: { color: '#eab308' }, lineStyle: { width: 1.5 } },
          { name: 'MAD上限', type: 'line', yAxisIndex: 1, data: dataset.upper, sampling: 'lttb', showSymbol: false, itemStyle: { color: '#ef4444' }, lineStyle: { width: 1, type: 'dashed' } },
          { name: 'MAD下限', type: 'line', yAxisIndex: 1, data: dataset.lower, sampling: 'lttb', showSymbol: false, itemStyle: { color: '#22c55e' }, lineStyle: { width: 1, type: 'dashed' } },
          { name: '突破阈值', type: 'scatter', yAxisIndex: 1, data: dataset.anomalies, large: true, itemStyle: { color: '#ef4444' }, symbolSize: 5, zlevel: 10 }
        ]
      };
      chart.setOption(option);
      this.chartInstances.push(chart);
    },

    clearCharts() { this.chartInstances.forEach(chart => chart.clear()); this.hasData = false; this.globalStatus = 'safe'; this.detectedWarningTypes = []; }
  }
};
</script>

<style scoped>
.anomaly-container { padding: 15px; background-color: #f1f5f9; min-height: 100vh; width: 100%; box-sizing: border-box;}
.search-card { margin-bottom: 15px; border-radius: 8px; border: none; }
.ptd-collapse >>> .el-collapse-item__header { border: none; height: 36px; color: #3b82f6; font-weight: bold; background: transparent; }
.dashboard-panel { margin-bottom: 15px; }

/* 态势感知卡片 */
.status-card { display: flex; align-items: center; padding: 20px; border-radius: 8px; height: 110px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.safe-bg { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; }
.danger-bg { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; animation: pulse-border 2s infinite; }
@keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); } 70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

.status-icon i { font-size: 48px; margin-right: 15px; }
.safe-bg .status-icon i { color: #22c55e; }
.danger-bg .status-icon i { color: #ef4444; }
.status-title { font-size: 13px; color: #64748b; margin-bottom: 4px; }
.status-text { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 8px;}
.danger-bg .status-text { color: #b91c1c; }

/* 动态诊断标签 */
.diagnosis-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.clickable-tag { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; font-weight: bold;}
.clickable-tag:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(239,68,68,0.3); }

/* 统计卡片与导航按钮交互 */
.stats-card { height: 152px; border-radius: 8px; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.stats-card >>> .el-card__header { padding: 12px 15px; background: #ffffff; font-weight: bold; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
.stats-grid { display: flex; justify-content: space-between; align-items: center; height: 100%; padding: 0 15px;}
.stat-item { text-align: center; display: flex; flex-direction: column; gap: 8px; position: relative;}
.stat-item .label { font-size: 13px; color: #64748b; }
.stat-item .value { font-size: 22px; font-weight: bold; color: #0f172a;}
.text-danger { color: #ef4444 !important; }

/* 🌟新增交互：高危区悬浮态 */
.clickable-stat {
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  background: #fff1f0;
  border: 1px dashed #ffa39e;
  transition: all 0.3s;
}
.clickable-stat:hover {
  background: #ffccc7;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(245, 34, 45, 0.2);
}

/* 图表区 */
.chart-list { display: flex; flex-direction: column; gap: 20px; width: 100%; }
.chart-item-large { width: 100%; height: 350px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }

/* ================= 核心：风险树 UI 样式 ================= */
.rule-dialog >>> .el-dialog__header { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.rule-dialog >>> .el-dialog__title { font-weight: bold; color: #1e293b; }
.logic-tree-container { display: flex; flex-direction: column; align-items: center; padding: 10px 0; background: #fafafa; border-radius: 8px; }
.logic-result { background: #ef4444; color: white; padding: 10px 30px; border-radius: 6px; font-size: 18px; box-shadow: 0 4px 6px rgba(239,68,68,0.3); z-index: 2;}
.logic-line-vertical { width: 4px; height: 30px; background: #cbd5e1; }
.logic-gate { background: #3b82f6; color: white; padding: 6px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 6px rgba(59,130,246,0.3); z-index: 2;}
.logic-branches { display: flex; flex-direction: column; gap: 15px; width: 85%; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; position: relative;}
.logic-branch { display: flex; justify-content: space-between; align-items: center; }
.param-box { flex: 1; background: #f1f5f9; padding: 10px; border-radius: 4px; border-left: 4px solid #64748b; font-weight: bold; color: #334155;}
.param-icon { margin-right: 8px; font-size: 16px; }
.logic-line-horizontal { height: 2px; width: 40px; background: #cbd5e1; position: relative;}
.logic-line-horizontal::after { content: ''; position: absolute; right: -5px; top: -4px; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 5px solid #cbd5e1;}
.dir-box { flex: 1; padding: 10px; border-radius: 4px; color: white; font-weight: bold; text-align: center;}
.dir-box.low { background: #10b981; box-shadow: 0 2px 4px rgba(16,185,129,0.3);} 
.dir-box.high { background: #ef4444; box-shadow: 0 2px 4px rgba(239,68,68,0.3);} 
.dir-box.none { background: #64748b; box-shadow: 0 2px 4px rgba(100,116,139,0.3);} 
.logic-explanation { margin-top: 25px; padding: 15px; background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 4px; color: #0f172a; line-height: 1.6; width: 90%; font-size: 13px;}
</style>
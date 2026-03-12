<template>
    <div>
        <div class="div-content">实时数据</div>
        <el-table
            :data="tableData"
            :header-cell-style="headerStyle"
            :cell-style="cellStyle"
            style="width: 100%;font-size:18px;"
        >
            <el-table-column prop="WOB" label="钻压" width="100"></el-table-column>
            <el-table-column prop="RPM" label="转速" width="100"></el-table-column>
            <el-table-column prop="TOR" label="扭矩" width="100"></el-table-column>
            <el-table-column prop="ROP" label="机械钻速" width="100"></el-table-column>
            <el-table-column prop="DOC" label="切削深度" width="100"></el-table-column>
            <el-table-column prop="Q" label="排量" width="100"></el-table-column>
            <el-table-column prop="MSE" label="机械比能" width="100"></el-table-column>
        </el-table>
        <el-table
            :data="tableData1"
            :header-cell-style="headerStyle"
            :cell-style="cellStyle"
            style="width: 100%;font-size:18px;"
        >
            <el-table-column prop="Formation" label="地层" width="100"></el-table-column>
            <el-table-column prop="BitDepth" label="钻头深度" width="100"></el-table-column>
            <el-table-column prop="HoleDepth" label="井眼深度" width="100"></el-table-column>
            <el-table-column prop="Lithology" label="岩性" width="100"></el-table-column>
            <el-table-column prop="StandPressure" label="立压" width="100"></el-table-column>
            <el-table-column prop="EntraceQ" label="进口排量" width="100"></el-table-column>
            <el-table-column prop="OutQ" label="出口流量" width="100"></el-table-column>
        </el-table>
        <div class="div-content">推荐作业参数</div>
        <el-table
            :data="tableData2"
            :header-cell-style="headerStyle"
            :cell-style="cellStyle"
            style="width: 100%;font-size:18px;"
        >
            <el-table-column prop="WOB" label="钻压" width="393"></el-table-column>
            <el-table-column prop="RPM" label="转速" width="393"></el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    name: 'CurrentPara',
    props: {
        BestDrillParameter: Array
    },
    data() {
        return {
            tableData: [
                {
                    WOB: '88',
                    RPM: '90',
                    TOR: '12',
                    ROP: '8',
                    DOC: '0.5',
                    Q: '30',
                    MSE: '200'
                }
            ],
            tableData1: [
                {
                    Formation: '飞一',
                    BitDepth: '1500',
                    HoleDepth: '1200',
                    Lithology: '石灰岩',
                    StandPressure: '5',
                    EntraceQ: '30',
                    OutQ: '30'
                }
            ],
            tableData2: [
                {
                    WOB: '88',
                    RPM: '90'
                }
            ]
        };
    },
    methods: {
        headerStyle() {
            return 'text-align:center';
        },
        cellStyle() {
            return 'text-align:center';
        }
    }
};
</script>

<style>
.div-content {
    text-align: center;
    font-size: 20px;
    background-color: #ccc;
}
</style>
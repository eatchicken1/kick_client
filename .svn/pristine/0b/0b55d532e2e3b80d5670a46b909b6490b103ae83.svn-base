<template>
    <div>
        <el-col :span="8">
            <span>钻头总比能计算参数设置</span>
            <el-divider></el-divider>
            <el-form ref="form" :model="Sum" label-width="120px" label-position="right">
                <el-form-item label="邻井井名">
                    <el-input v-model="Sum.jh" placeholder="邻井井名"></el-input>
                </el-form-item>
                <el-form-item label="钻头厂家">
                    <el-input v-model="Sum.manufactor" placeholder="钻头厂家"></el-input>
                </el-form-item>
                <el-form-item label="钻头型号">
                    <el-input v-model="Sum.model" placeholder="钻头型号"></el-input>
                </el-form-item>
                <el-form-item label="出井新度">
                    <el-input v-model="Sum.endWear" placeholder="出井新度：50%"></el-input>
                </el-form-item>
                <el-form-item label="入井时间">
                    <el-date-picker v-model="Sum.startTime" type="datetime" value-format="yyyy/MM/dd HH:mm:ss" format="yyyy/MM/dd HH:mm:ss" placeholder="选择时间"></el-date-picker>
                </el-form-item>
                <el-form-item label="出井时间">
                    <el-date-picker v-model="Sum.endTime" type="datetime" value-format="yyyy/MM/dd HH:mm:ss" format="yyyy/MM/dd HH:mm:ss" placeholder="选择时间"></el-date-picker>
                </el-form-item>
                <el-form-item label="比能计算">
                    <el-button type="primary" @click="saveSum">钻头总比能计算</el-button>
                </el-form-item>
                <el-form-item label="计算结果">
                    <el-input v-model="result">
                        <template slot="append">MPa</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </el-col>
    </div>
</template>

<script>
import { fetchApidata } from '../../../api/index';
export default {
    name: 'SUM',
    data() {
        return {
            isSumCalc: false,
            Sum: { jh: this.$store.state.jh, manufactor: '江汉', model: 'zj5632', endWear: 0.5, startTime: "", endTime: "", auth: this.$store.state.token },
            a: 0,
            result: ''
        };
    },
    methods: {
        async saveSum() {
            const res = await fetchApidata('BitWear/SumMSECalc', this.Sum, 'get');
            this.a = res.content[0];
            this.result = (this.a * Math.tan(0.99 * 3.1415926 / 2)).toFixed(2);
        },
    }
};
</script>

<style>
</style>
<template>
    <div>
        <el-row>
            <el-col :span="20">
                <span style="margin: 0 0 0 25px">井深：</span
                ><el-input v-model="depth" placeholder="井深" style="width: 150px">
                    <template slot="append">m</template>
                </el-input>
                <span style="margin: 0 0 0 25px">开始时间：</span
                ><el-date-picker v-model="startTime" type="datetime" placeholder="选择开始时间"> </el-date-picker>
                <span style="margin: 0 0 0 25px">结束时间：</span
                ><el-date-picker v-model="endTime" type="datetime" placeholder="选择结束时间"> </el-date-picker>
                <el-button type="primary" style="margin: 0 0 0 35px" @click="calc">计算分析</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24"></el-col>
        </el-row>
    </div>
</template>

<script>
import { fetchApidata } from '../../../api/index';
export default {
    name: 'hydraulics',
    data() {
        return {
            wellName: '龙004-X1',
            depth: 6000,
            startTime: '2013/06/17 07:50:39',
            endTime: '2013/06/20 02:24:39'
        };
    },
    mounted() {},
    methods: {
        async calc() {
            var data = { jh: this.wellName, depth: this.depth, startTime: this.startTime, endTime: this.endTime };
            const res = await fetchApidata('Hydro/Calc', data, 'get');

            console.log('calc result:', res);
        }
    }
};
</script>

<style>
</style>

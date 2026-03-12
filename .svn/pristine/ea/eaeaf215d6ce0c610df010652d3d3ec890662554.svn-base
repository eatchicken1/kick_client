<template>
    <div class="block">
        <el-row>
            <el-col :span="24">
                <span class="demonstration">监测时间</span>
                <el-date-picker v-model="StartTime" type="datetime" value-format="yyyy/MM/dd HH:mm:ss" format="yyyy/MM/dd HH:mm:ss" placeholder="选择时间">
                </el-date-picker>
                    <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="calc1">实时监测</el-button>
                <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="stopCalc">停止计算</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <!-- <el-card> -->
                <swim-lane :tableHead="tableHead" :data="changeData" :echartWidth="2000" :echartHeight="1000"></swim-lane>
                <!-- </el-card> -->
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-input type="textarea" :rows="8" placeholder="请输入内容" v-model="textarea1"> </el-input>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { fetchApidata } from '../../../api/index';
import SwimLane from '../../Drawing/SwimLane';
export default {
    name: 'overflow',
    components: {
        'swim-lane': SwimLane
    },
    data() {
        return {
            wellName: '龙004-X1',
            timer: null,
            textarea1: '',
            textarea2: '',
            textarea3: '',
            StartTime: '2013/06/05 08:00:00',
            tableHead: [
                {
                    name: '破裂压力(g/cm³)',
                    min: 0,
                    max: 3,
                    groupId: 0,
                    data: []
                },
                {
                    name: 'ECD',
                    min: 0,
                    max: 3,
                    groupId: 0,
                    data: []
                },
                {
                    name: '孔隙压力(g/cm³)',
                    min: 0,
                    max: 3,
                    groupId: 0,
                    data: []
                },
                {
                    name: '坍塌压力(g/cm³)',
                    min: 0,
                    max: 3,
                    groupId: 0,
                    data: []
                },
                {
                    name: '池体积变化量(m³)',
                    min: 0,
                    max: 20,
                    groupId: 1,
                    data: []
                },
                {
                    name: '总池体积(m³)',
                    min: 0,
                    max: 300,
                    groupId: 1,
                    data: []
                },
                {
                    name: '全烃含量',
                    min: 0,
                    max: 100,
                    groupId: 1,
                    data: []
                },
                {
                    name: '相对出口流量',
                    min: 0,
                    max: 100,
                    groupId: 1,
                    data: []
                },
                {
                    name: 'MSE机械比能',
                    min: 0,
                    max: 3000,
                    groupId: 2,
                    data: []
                },
                {
                    name: '钻时(min/m)',
                    min: 0,
                    max: 100,
                    groupId: 2,
                    data: []
                },
                {
                    name: '入口密度(g/cm³)',
                    min: 0,
                    max: 3,
                    groupId: 3,
                    data: []
                },
                {
                    name: '出口密度(g/cm³)',
                    min: 0,
                    max: 3,
                    groupId: 3,
                    data: []
                },
                {
                    name: '入口流量(L/min)',
                    min: 0,
                    max: 50,
                    groupId: 4,
                    data: []
                },
                {
                    name: '出口流量(L/min)',
                    min: 0,
                    max: 50,
                    groupId: 4,
                    data: []
                },
                {
                    name: '计算立压(MPa)',
                    min: 0,
                    max: 60,
                    groupId: 5,
                    data: []
                },
                {
                    name: '实测立压(MPa)',
                    min: 0,
                    max: 60,
                    groupId: 5,
                    data: []
                },
                {
                    name: '计算扭矩(KNM)',
                    min: 0,
                    max: 50,
                    groupId: 6,
                    data: []
                },
                {
                    name: '实测扭矩(KNM)',
                    min: 0,
                    max: 50,
                    groupId: 6,
                    data: []
                },
                {
                    name: '计算悬重(KDN)',
                    min: 0,
                    max: 2500,
                    groupId: 7,
                    data: []
                },
                {
                    name: '实测悬重(KDN)',
                    min: 0,
                    max: 2500,
                    groupId: 7,
                    data: []
                },
                {
                    name: '计算井底压差',
                    min: -20,
                    max: 20,
                    groupId: 8,
                    data: []
                },
                {
                    name: '套压(MPA)',
                    min: 0,
                    max: 50,
                    groupId: 8,
                    data: []
                },
                {
                    name: '泥岩识别曲线',
                    min: 0,
                    max: 2,
                    groupId: 9,
                    data: []
                },
                {
                    name: '砂岩识别曲线',
                    min: 0,
                    max: 2,
                    groupId: 9,
                    data: []
                }
            ],
            changeData: null
        };
    },
    mounted() {
        this.StartTime = this.$store.state.StartTime;
        this.wellName = this.$store.state.jh;
    },
    methods: {
        async calc2() {
            var data = { jh: this.wellName, time: this.StartTime, auth: this.$store.state.token };
            const res = await fetchApidata('Monitor/Calc', data, 'get');
            console.log(res);
            if (res.isSuccess) {
                this.StartTime = res.content[0][1].time;
                var message1 = '';
                for (var i = 0; i < res.content[2].length; i++) {
                    message1 += res.content[2][i].message + '，' + res.content[2][i].reason + '，' + res.content[2][i].type + '\n';
                }
                for (var i = 0; i < res.content[3].length; i++) {
                    message1 += res.content[3][i].message + '，' + res.content[3][i].reason + '，' + res.content[3][i].type + '\n';
                }
                for (let i = 0; i < res.content[0].length; i++) {
                    if (res.isSuccess) {
                        setTimeout(() => {
                            let temp = new Map();
                            temp.set('破裂压力(g/cm³)', [
                                (res.content[1][i].fracturePressureGrad).toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time.split(' ')[1]
                            ]);
                            temp.set('ECD', [res.content[1][i].ecd.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('孔隙压力(g/cm³)', [res.content[1][i].porePressureGrad.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('坍塌压力(g/cm³)', [(res.content[1][i].collapsePressureGrad).toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('池体积变化量(m³)', [res.content[0][i].tvolcact.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('总池体积(m³)', [res.content[0][i].tvolact.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('全烃含量', [res.content[0][i].gasa.toFixed(3)/10000, res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('相对出口流量', [res.content[0][i].mfop.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('MSE机械比能', [res.content[1][i].mse.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('钻时(min/m)', [res.content[0][i].ropa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('入口密度(g/cm³)', [res.content[0][i].mdia.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('出口密度(g/cm³)', [res.content[0][i].mdoa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('入口流量(L/min)', [res.content[0][i].mfia.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('出口流量(L/min)', [res.content[0][i].mfoa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('计算立压(MPa)', [res.content[1][i].sppa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('实测立压(MPa)', [res.content[0][i].sppa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('计算扭矩(KNM)', [res.content[1][i].torqa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('实测扭矩(KNM)', [res.content[0][i].torqa.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('计算悬重(KDN)', [res.content[1][i].hkla.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('实测悬重(KDN)', [res.content[0][i].hkla.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('计算井底压差', [res.content[1][i].difp.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('套压(MPA)', [res.content[0][i].chkp.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                           temp.set('泥岩识别曲线', [res.content[1][i].sim.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            temp.set('砂岩识别曲线', [res.content[1][i].sim2.toFixed(3), res.content[0][i].deptbitm+ '\n' + res.content[0][i].time.split(' ')[1]]);
                            this.changeData = temp;
                        }, 500);
                    }
                }
                this.textarea1 += message1;
            } else {
                this.$message.error(res.message);
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        calc1() {
            //  this.calc2();
            this.timer = setInterval(this.calc2, 5000);
        },
        stopCalc: function () {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
};
</script>


<style scoped>
.input {
    width: 160px;
}
</style>
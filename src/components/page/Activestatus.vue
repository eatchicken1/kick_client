<template>
    <div>
        <el-form label-width="140px">
            <span>监测参数设置</span>
            <el-divider></el-divider>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="开始时间">
                        <el-date-picker class="input" v-model="StartTime" type="datetime" placeholder="选择日期时间" align="right">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="">
                        <el-button @click="startCalc" type="primary">开始计算</el-button>
                        <el-button @click="stopCalc" type="primary">停止计算</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-col :span="24">
            <swim-lane :tableHead="tableHead" :data="changeData" :echartWidth="2000" :echartHeight="1000" :yAxisType="category"></swim-lane>
            
        </el-col>
        <el-row>
            <el-col :span="24">
                <el-input type="textarea" :rows="8" placeholder="请输入内容" v-model="textarea1"> </el-input>
            </el-col>
        </el-row>
    </div>
</template>



<script>
//  api引入  参数传递与方法相同，不能乱设

import { Activestatus2 } from '../../api/index';
import SwimLane from '../Drawing/SwimLane';

export default {
    name: 'monitor',
    components: {
        'swim-lane': SwimLane
    },
    data() {
        return {
         
            StartTime: '2021-11-22 14:58:14',
            jh: '龙004-X1',
            timer: null,
            loadding: null,
            textarea1: '',
            category: 'category',
            tableHead: [
                {
                    name: '立管压力（MPa）',
                    min: 0,
                    max: 40,
                    groupId: 0,
                    data: []
                },
                {
                    name: '转速(r/min)',
                    min: 0,
                    max: 200,
                    groupId: 1,
                    data: []
                },
                {
                    name: '大钩载荷(kN)',
                    min: 0,
                    max: 2000,
                    groupId: 2,
                    data: []
                },
                {
                    name: '扭矩(KNM)',
                    min: 0,
                    max: 40,
                    groupId: 3,
                    data: []
                },

                {
                    name: '泵冲1',
                    min: 0,
                    max: 100,
                    groupId: 4,
                    data: []
                },
                {
                    name: '泵冲2',
                    min: 0,
                    max: 100,
                    groupId: 5,
                    data: []
                },{
                    name: '泵冲3',
                    min: 0,
                    max: 100,
                    groupId: 6,
                    data: []
                },
                {
                    name: '大钩高度',
                    min: 0,
                    max: 35,
                    groupId: 7,
                    data: []
                },
                
            ],
            changeData: null,
        };
    },
    //   mounted() {
    //     this.StartTime = this.$store.state.value1;
    //     this.jh = this.$store.state.jh;   
    //      },
    methods: {
        Activestatus2() {
            Activestatus2({
                jh: this.$store.state.jh,
                StartTime: this.StartTime
            })
                //push的参数小写，否则不能识别。
                .then((res) => {
                    if (res.isSuccess) {
                        var message1 = '';
                        var message2 = '';
                        //this.loadding.close();
                        this.StartTime = res.content.startTime;
                        let temp = new Map();
                        temp.set('立管压力（MPa）', [res.content.sppa, res.content.bitdepth+ '\n' + res.content.startTime.split(' ')[1]]);
                        temp.set('转速(r/min)', [res.content.rpm, res.content.bitdepth+ '\n' +  res.content.startTime.split(' ')[1]]);
                        temp.set('大钩载荷(kN)', [res.content.hkla, res.content.bitdepth+ '\n' +  res.content.startTime.split(' ')[1]]);
                        temp.set('扭矩(KNM)', [res.content.tor, res.content.bitdepth+ '\n' +  res.content.startTime.split(' ')[1]]);
                        temp.set('泵冲1', [res.content.spm1, res.content.bitdepth+ '\n' +  res.content.startTime.split(' ')[1]]);
                        temp.set('泵冲2', [res.content.spm2, res.content.bitdepth+ '\n' +  res.content.startTime.split(' ')[1]]);
                        temp.set('泵冲3', [res.content.spm3, res.content.bitdepth+ '\n' +  res.content.startTime.split(' ')[1]]);
                        temp.set('大钩高度', [res.content.blkp, res.content.bitdepth+ '\n' + res.content.startTime.split(' ')[1]]);
                        //   temp.set('立管压力（MPa）', [res.content.sppa, res.content.startTime+ '\n' + res.content.bitdepth.split(' ')[1]]);
                        // temp.set('转速(r/min)', [res.content.rpm, res.content.startTime+ '\n' +  res.content.bitdepth.split(' ')[1]]);
                        // temp.set('大钩载荷(kN)', [res.content.hkla, res.content.startTime+ '\n' +  res.content.bitdepth.split(' ')[1]]);
                        // temp.set('扭矩(KNM)', [res.content.tor, res.content.startTime+ '\n' +  res.content.bitdepth.split(' ')[1]]);
                        // temp.set('泵冲1', [res.content.spm1, res.content.startTime+ '\n' +  res.content.bitdepth.split(' ')[1]]);
                        // temp.set('泵冲2', [res.content.spm2, res.content.startTime+ '\n' +  res.content.bitdepth.split(' ')[1]]);
                        // temp.set('泵冲3', [res.content.spm3, res.content.startTime+ '\n' +  res.content.bitdepth.split(' ')[1]]);
                        // temp.set('大钩高度', [res.content.blkp, res.content.startTime+ '\n' + res.content.bitdepth.split(' ')[1]]);
                       //temp.set('实测扭矩(KNM)', [res.content[0][i].torqa.toFixed(3), res.content[0][i].deptbitm + '\n' + res.content[1][res.content[1].length - 1].time.split(' ')[1]]);


                     
                        message2 = 'ActivetyStatus:' +res.content.activetyStatus+'，'+'actc:' +res.content.actc+'，';
                        //+ '，'+'type:'+ res.content.type+'，'+'message:'+res.content.message+'，'+'reason:'+res.content.reason+'，';
                        message1 =
                            'hkla:' +
                            res.content.hkla +
                            '，' +
                            'torqa:' +
                            res.content.tor +
                            '，' +
                            'sppa:' +
                            +res.content.sppa +
                            '，' +
                            'rpm:' +
                            +res.content.rpm +
                            '，' +
                            'depthChange:' +
                            +res.content.depthChange +
                            '，' +
                            'bitChange:' +
                            +res.content.bitChange +
                            '，' +
                            'blkpChange:' +
                            +res.content.blkpChange +
                            '，' +
                            '\n';

                        this.textarea1 += message2 + message1;
                           this.changeData = temp;
                        console.log(res);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请输入正确时间');
                });
        },
        startCalc: function () {
            this.timer = setInterval(this.Activestatus2, 2000);
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
    width: 200px;
}
</style>
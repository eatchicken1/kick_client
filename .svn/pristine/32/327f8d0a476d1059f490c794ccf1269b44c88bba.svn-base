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
            <swim-lane :tableHead="tableHead" :data="changeData" :echartWidth="1800" :echartHeight="1000"></swim-lane>
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

import { Activestatus } from '../../../api/index';
import SwimLane from '../../Drawing/SwimLane';

export default {
    name: 'monitor',
    components: {
        'swim-lane': SwimLane
    },
    data() {
        return {
            
            tableHead: [
                {
                    name: '立管压力（MPa）',
                    min: 0,
                    max: 50,
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
                    max: 3000,
                    groupId: 2,
                    data: []
                },
                {
                    name: '扭矩(KNM)',
                    min: 0,
                    max: 100,
                    groupId: 3,
                    data: []
                }
            ],
            changeData: null,
            StartTime: '2013/06/16 14:36:39',
            jh: '龙004-X1',
            timer: null,
            H: 5000,
            loadding: null,
            textarea1: '',
           

        };
    },
    methods: {
        Activestatus() {
            Activestatus({
                jh: this.jh,
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
                        temp.set('立管压力（MPa）', [res.content.sppa, res.content.depth]);
                        temp.set('转速(r/min)', [res.content.rpm, res.content.depth]);
                        temp.set('大钩载荷(kN)', [res.content.hkla, res.content.depth]);
                        temp.set('扭矩(KNM)', [res.content.tor, res.content.depth]);




                        this.changeData = temp;
                        message2 = 'actc:' +res.content.activetyStatus+
                            '，'+'type:'+ res.content.type+'，'+'message:'+res.content.message+'，'+'reason:'+res.content.reason+'，';
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
                            '\n';

                        this.textarea1 += message2 + message1;
                        console.log(res);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        startCalc: function () {
            this.timer = setInterval(this.Activestatus, 2000);
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
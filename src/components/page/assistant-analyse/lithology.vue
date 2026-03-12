<template>
    <div class="block">
        <el-row>
            <el-col :span="24">
                <span class="demonstration">监测时间</span>
               <el-date-picker class="input" v-model="value1" type="datetime" placeholder="选择日期时间" align="right">
                        </el-date-picker>
                <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="calc1">实时监测</el-button>
                <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="stopCalc">停止计算</el-button>
                <!-- <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="calc2">实时数据</el-button> -->
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="21">
                <!-- <el-card> -->
                <swim-lane :tableHead="tableHead" :data="changeData" :echartWidth="1450" :echartHeight="1000" :yAxisType="category"></swim-lane>
                <!-- </el-card> -->
            </el-col>
            <el-col :span="3">
                <el-input type="textarea" :rows="52" placeholder="请输入内容" v-model="textarea1"> </el-input>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { fetchApidata } from '../../../api/index';
import SwimLane from '../../Drawing/SwimLane';
export default {
    name: 'lithology',
    components: {
        'swim-lane': SwimLane
    },
    data() {
        return {
            wellName: '龙004-X1',
            value1: '2021-11-22 15:40:39',
            //value1: '2021-11-22 14:58:14',
             category: 'category',
            textarea1: '',
             timer: null,   
            tableHead: [
                {
                    name: '钻时(min/m)',
                    min: 0,
                    max: 50,
                    groupId: 0,
                    data: []
                },
                {
                    name: '实测扭矩(KNM)',
                    min: 0,
                    max: 50,
                    groupId: 1,
                    data: []
                },
                {
                    name: '实测悬重(KDN)',
                    min: 0,
                    max: 2500,
                    groupId: 2,
                    data: []
                },
                {
                    name: '转盘转速',
                    min: 0,
                    max: 200,
                    groupId: 3,
                    data: []
                },
                {
                    name: '石牛栏组识别曲线',
                    min: 0.6,
                    max: 1,
                    groupId: 4,
                    data: []
                },
                {
                    name: '龙马溪组识别曲线',
                    min: 0.6,
                    max: 1,
                    groupId: 4,
                    data: []
                }
            ],
            changeData: null
        };
    },
    mounted() {
        this.time = this.value1;
        this.wellName = this.$store.state.jh;
      
    },
    methods: {
        async calc2() {
            var data = { jh: this.wellName, time: this.value1 }; 
            const res = await fetchApidata('Sim/Calc', data, 'get');
            this.value1 = res.content[1][res.content[1].length - 1].time;
            console.log(this.value1);
            console.log(res);
            if (res.isSuccess) {
                var message1 = '';
                for (let i = 0; i < res.content[0].length - 1; i++) {
                    if (res.content[0][i].sim < res.content[0][i].sim2) {
                        message1 = res.content[0][i].deptbitm + 'm砂岩，' + '\n';
                    } else if (res.content[0][i].sim > res.content[0][i].sim2) {
                        message1 = res.content[0][i].deptbitm + 'm泥岩，' + '\n';
                    } else if ((res.content[0][i].sim = 0)) {
                        message1 = res.content[0][i].deptbitm + '非钻进工况，' + '\n';
                    }
                }
                this.value1 = res.content[1][res.content[1].length - 1].time;
                this.textarea1 += message1;
                 console.log(this.value1);
            } else {
                this.$message.error(res.message);
            }
            if (res.isSuccess) {
                for (let i = 0; i < res.content[0].length - 1; i++) {
                    setTimeout(() => {
                        let temp = new Map();

                        temp.set('钻时(min/m)', [res.content[0][i].ropa.toFixed(3),res.content[0][i].deptbitm + '\n' + res.content[1][0].time.split(' ')[1] ]);

                        temp.set('实测扭矩(KNM)', [res.content[0][i].torqa.toFixed(3), res.content[0][i].deptbitm + '\n' + res.content[1][0].time.split(' ')[1]]);

                        temp.set('实测悬重(KDN)', [res.content[0][i].hkla.toFixed(3), res.content[0][i].deptbitm + '\n' + res.content[1][0].time.split(' ')[1]]);

                        temp.set('转盘转速', [res.content[0][i].rpma.toFixed(3), res.content[0][i].deptbitm + '\n' + res.content[1][0].time.split(' ')[1]]);

                        temp.set('石牛栏组识别曲线', [res.content[0][i].sim.toFixed(3), res.content[0][i].deptbitm + '\n' + res.content[1][0].time.split(' ')[1]]); //

                        temp.set('龙马溪组识别曲线', [res.content[0][i].sim2.toFixed(3), res.content[0][i].deptbitm + '\n' + res.content[1][0].time.split(' ')[1]]); //
                        this.changeData = temp;
                    }, 8000);
                }
            } else {
                this.$message.error('请求失败');
            }
        },
        calc1() {
             //this.calc2();
            this.timer = setInterval(this.calc2, 8000);
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
    width: 220px;
}
</style>
<template>
    <div class="block">
        <el-row>
            <el-col :span="24">
                <span class="demonstration">监测时间</span>
                <el-date-picker v-model="value1" type="datetime" placeholder="选择时间"> </el-date-picker>

                <el-button icon="el-icon-menu" style="margin-left: 200px" @click="calc1" type="primary">实时监测</el-button>
                <el-button icon="el-icon-menu" style="margin-left: 300px" @click="calc4" type="primary">停止计算</el-button>
                <!-- <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="calc2">实时数据</el-button> -->
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <!-- <el-card> -->
                <swim-lane
                    :tableHead="tableHead"
                    :data="changeData"
                    :echartWidth="2000"
                    :echartHeight="1000"
                    :yAxisType="category"
                ></swim-lane>
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
import { fetchApidata } from '../../api/index';
import SwimLane from '../Drawing/SwimLane';
export default {
    name: 'overflow',
    components: {
        'swim-lane': SwimLane
    },
    data() {
        return {
            wellName: '宁209H42-3',
            value1: '2022-06-28 17:00:14',
            //value1: '2021-11-22 15:15:50',
            // timer: null,
            category: 'category',
            //category:控制按时间显示
            textarea1: '',
            textarea2: '',
            textarea3: '',
            // StartTime: '2013/06/05 08:00:00',
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
                    name: '漏失压力(g/cm³)',
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
                    max: 100,
                    groupId: 4,
                    data: []
                },
                {
                    name: '出口流量(%)',
                    min: 0,
                    max: 100,
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
                    max: 3000,
                    groupId: 7,
                    data: []
                },
                {
                    name: '实测悬重(KDN)',
                    min: 0,
                    max: 3000,
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
                // {
                //     name: '管柱运行速度(m/s)',
                //     min: 0,
                //     max: 3,
                //     groupId: 9,
                //     data: []
                // },
                // {
                //     name: '临界起钻速度(m/s)',
                //     min: 0,
                //     max: 3,
                //     groupId: 9,
                //     data: []
                // },
                // {
                //     name: '临界下钻速度(m/s)',
                //     min: 0,
                //     max: 3,
                //     groupId: 9,
                //     data: []
                // },
                {
                    name: '地层压力预测',
                    min: 0,
                    max: 3,
                    groupId: 9,
                    data: []
                },
                {
                    name: 'ECD1',
                    min: 0,
                    max: 3,
                    groupId: 9,
                    data: []
                },
                {
                    name: 'dc指数',
                    min: 0,
                    max: 3,
                    groupId: 10,
                    data: []
                }
            ],
            changeData: null
        };
    },
    mounted() {
        this.value1 = this.$store.state.StartTime;
        this.wellName = this.$store.state.jh;
        // console.log(this.tableHead[0].data);
    },
    methods: {
        async calc2() {
            var data = { jh: this.wellName, time: this.value1, auth: this.$store.state.token };
            console.log(data);
            const res = await fetchApidata('Monitor/Calc', data, 'get');
            console.log(res);
    
            if (res.isSuccess) {
                var message1 = '';
                this.value1 = res.content[1][res.content[1].length-1].time;
                for (var i = 0; i < res.content[2].length; i++) {
                    message1 += res.content[2][i].message + '，' + res.content[2][i].reason + '\n';
                }
                for (let i =  res.content[0].length - 2; i < res.content[0].length - 1; i++) {
                    if (res.isSuccess) {
                          console.log(res.content[0].length - 2)
                           console.log(res.content[0].length - 1)
                        console.log(res.content[0][i].time)
                        console.log(res.content[0][i].time)
                        setTimeout(() => {
                            let temp = new Map();
                            temp.set('破裂压力(g/cm³)', [
                            res.content[1][i].fracturePressureGrad.toFixed(3),
                            res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            //  temp.set('破裂压力(g/cm³)', [0,res.content[0][i].deptbitm + '\n' + res.content[1][res.content[1].length - 1].time]); //
                            temp.set('ECD', [
                                res.content[1][i].ecd.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('孔隙压力(g/cm³)', [
                                res.content[1][i].porePressureGrad.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]); //
                            temp.set('漏失压力(g/cm³)', [
                                res.content[1][i].collapsePressureGrad.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]); //
                            temp.set('池体积变化量(m³)', [
                                res.content[0][i].tvolcact.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('总池体积(m³)', [
                                res.content[0][i].tvolact.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('全烃含量', [
                                res.content[0][i].gasa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('相对出口流量', [
                                res.content[0][i].mfop.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('MSE机械比能', [
                                res.content[1][i].mse.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('钻时(min/m)', [
                                res.content[0][i].ropa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('入口密度(g/cm³)', [
                                res.content[0][i].mdia.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('出口密度(g/cm³)', [
                                res.content[0][i].mdoa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('入口流量(L/min)', [
                                res.content[0][i].mfia.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('出口流量(%)', [
                                res.content[0][i].mfoa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('计算立压(MPa)', [
                                res.content[1][i].sppa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('实测立压(MPa)', [
                                res.content[0][i].sppa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('计算扭矩(KNM)', [
                                res.content[1][i].torqa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('实测扭矩(KNM)', [
                                res.content[0][i].torqa.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                                
                            ]);
                            temp.set('计算悬重(KDN)', [
                                res.content[1][i].hkla.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('实测悬重(KDN)', [
                                res.content[0][i].hkla.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('计算井底压差', [
                                res.content[1][i].difP3.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]); //
                            temp.set('套压(MPA)', [
                                res.content[0][i].chkp.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            // temp.set('管柱运行速度(m/s)', [res.content[1][i].v.toFixed(6), res.content[0][i].deptbitm]); //
                            // temp.set('临界起钻速度(m/s)', [res.content[0][i].chkp.toFixed(3), res.content[0][i].deptbitm]); //
                            // temp.set('临界下钻速度(m/s)', [res.content[0][i].chkp.toFixed(3), res.content[0][i].deptbitm]); //
                            temp.set('地层压力预测', [
                                res.content[1][i].pp.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]); //
                            temp.set('ECD1', [
                                res.content[1][i].ecd.toFixed(2),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            temp.set('dc指数', [
                                res.content[1][i].dc.toFixed(3),
                                res.content[0][i].deptbitm + '\n' + res.content[0][i].time
                            ]);
                            
                          
                            
                            //
                            // temp.set('dc指数', [
                            //     res.content[1][i].dc.toFixed(3),
                            //     res.content[0][i].deptbitm + '\n' + res.content[1][res.content[1].length - 1].time
                            // ]); //
                            this.changeData = temp;
                        }, 4000);

                        //console.log('1',temp);

                        this.textarea1 += message1;
                    }
                }
            } else {
                this.$message.error('请求失败');
                // this.$message.error(res.message);
                // clearInterval(this.timer);
                // this.timer = null;
            }
            //  this.timer = setInterval(this.calc1, 2000);
        },
        calc1() {
             //this.calc2();
            this.timer = setInterval(this.calc2, 5000);
        },
         calc4() {
           clearInterval(this.timer);
            this.timer = null;
        },
   
    }
};
</script>


<style scoped>
.input {
    width: 160px;
}
</style>
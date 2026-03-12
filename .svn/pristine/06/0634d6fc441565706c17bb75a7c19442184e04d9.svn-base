<template>
    <div class="block">
        <el-row>
            <el-col :span="24">
                <span class="demonstration">监测时间</span>
                <el-date-picker v-model="value1" type="datetime" placeholder="选择时间"> </el-date-picker>
                <el-button type="primary" icon="el-icon-menu" style="margin-left: 200px" @click="calc1">实时监测</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-input type="textarea" :rows="30" placeholder="请输入内容" v-model="textarea1"> </el-input>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-input type="textarea" :rows="30" placeholder="请输入内容" v-model="textarea2"> </el-input>
            </el-col>
            <el-col :span="12">
                <el-input type="textarea" :rows="30" placeholder="请输入内容" v-model="textarea3"> </el-input>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { fetchApidata } from '../../../api/index';

export default {
    data() {
        return {
            wellName: '龙004-X1',
            value1: '2012-03-21',
            textarea1: '',
            textarea2: '',
            textarea3: ''
        };
    },

    mounted() {},
    methods: {
        async calc1() {
            var data = { jh: this.wellName, time: this.value1 };
            const res = await fetchApidata('Monitor/Calc', data, 'get');

            console.log('calc result:', res);

            if (res.isSuccess) {
                var message1 = '';
                 var message2 = '';
                  var message3 = '';
                for (var i = 0; i < res.content[2].length; i++) {
                    message1 += res.content[2][i].message + '，' + res.content[2][i].reason + '\n';
                    message2 += 'hkla:'+res.content[1][i].hkla.toFixed(2) +'，'+ 'torqa:'+ res.content[1][i].torqa.toFixed(2)+ '，'+ 'mse:'+ res.content[1][i].mse.toFixed(2)+ '，'+ 'sppa:'+  res.content[1][i].sppa.toFixed(2)+ '，'+ 'ecd:'+  + res.content[1][i].ecd.toFixed(2) + '，' +'\n';
                    message3 += 'hkla:'+res.content[0][i].hkla.toFixed(2) + '，'+ 'torqa:'+ res.content[0][i].torqa.toFixed(2)+ '，'+ 'sppa:'+  + res.content[0][i].sppa.toFixed(2)+ '，'+ 'ropa:'+   res.content[0][i].ropa.toFixed(2)+ '，'+  'MDOA:' + res.content[0][i].mdoa.toFixed(2)+ '，'+ 'MDIA:' + res.content[0][i].mdia.toFixed(2) +'\n';
                }

                this.textarea1 = message1;
                this.textarea2 = message2;
                this.textarea3 = message3;
            }
        }
    }
};
</script>


<style scoped>

</style>
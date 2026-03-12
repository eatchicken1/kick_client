<template>
    <div>
        <span>漏失压力计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.rho">
                            <template slot="append">g/m³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="漏失层深度">
                        <el-input class="input" v-model="params.HL">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="静液面至井口的距离">
                        <el-input class="input" v-model="params.HB">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1">井眼漏失压力计算(静液柱法)</el-button>
                    </el-form-item>
                    <el-form-item label="井眼漏失压力">
                        <el-input class="input" v-model="Hydrostaticmethod_losspressure">
                            <template slot="append">KPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="260px">
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.rho1">
                            <template slot="append">g/m³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="漏失层深度">
                        <el-input class="input" v-model="params.HL1">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="用QI1循环时井口的注入流量QI1">
                        <el-input class="input" v-model="params.QI1">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="用QI2循环时井口的注入流量QI2">
                        <el-input class="input" v-model="params.QI2">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="用QI1循环时井口的返出流量QO1">
                        <el-input class="input" v-model="params.QO1">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="用QI2循环时井口的返出流量QO2">
                        <el-input class="input" v-model="params.QO2">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="环空压力损失系数">
                        <el-input class="input" v-model="params.K">
                            <template slot="append">无量纲</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc2">井眼漏失压力(循环法)</el-button>
                    </el-form-item>
                    <el-form-item label="井眼漏失压力">
                        <el-input class="input" v-model="CirculatingmethodLosspressure">
                            <template slot="append">KPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { wellboremudloss1 } from '../../../api/index';
import { wellboremudloss2 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                rho: 1.4,
                HL: 1000,
                HB: 500,

                rho1: 1.4,
                HL1: 2000,
                QI1: 24,
                QI2: 20,
                QO1: 24,
                QO2: 16,
                K: 0.0001
            },
            Hydrostaticmethod_losspressure: 0,
            CirculatingmethodLosspressure: 0
        };
    },
    methods: {
        calc1() {
            wellboremudloss1({
                rho: this.params.rho,
                HL: this.params.HL,
                HB: this.params.HB
            })
                .then((res) => {
                    console.log(res);
                    this.Hydrostaticmethod_losspressure = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            wellboremudloss2({
                rho: this.params.rho1,
                HL: this.params.HL1,
                QI1: this.params.QI1,
                QI2: this.params.QI2,
                QO1: this.params.QO1,
                QO2: this.params.QO2,
                K: this.params.K
            })
                .then((res) => {
                    console.log(res);
                    this.CirculatingmethodLosspressure = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        }
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
</style>
<template>
    <div>
        <span>管内及环空压耗计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="140px">
                    <el-form-item label="300转读数">
                        <el-input class="input" v-model="params.O_300">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="600转读数">
                        <el-input class="input" v-model="params.O_600">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆内径">
                        <el-input class="input" v-model="params.d_inner">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q_innner">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="宾汉流体管内">
                        <el-button type="primary" icon="el-icon-menu" @click="calc1">计算</el-button>
                    </el-form-item>
                    <el-form-item label="压力梯度">
                        <el-input class="input" v-model="pi_bin">
                            <template slot="append">MPa/m</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="140px">
                    <el-form-item label="300转读数">
                        <el-input class="input" v-model="params.O1_300">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="600转读数">
                        <el-input class="input" v-model="params.O1_600">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆内径">
                        <el-input class="input" v-model="params.d1_inner">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ1_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q1_innner">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="幂律流体管内">
                        <el-button type="primary" icon="el-icon-menu" @click="calc2">计算</el-button>
                    </el-form-item>
                    <el-form-item label="压力梯度">
                        <el-input class="input" v-model="pi_pow">
                            <template slot="append">MPa/m</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="140px">
                    <el-form-item label="300转读数">
                        <el-input class="input" v-model="params.O2_300">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="600转读数">
                        <el-input class="input" v-model="params.O2_600">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆内径">
                        <el-input class="input" v-model="params.d2_inner">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ2_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q2_innner">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱长度">
                        <el-input class="input" v-model="params.L2_zuanzhu">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井眼直径">
                        <el-input class="input" v-model="params.dh2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="宾汉流体环空">
                        <el-button type="primary" icon="el-icon-menu" @click="calc3">计算</el-button>
                    </el-form-item>
                    <el-form-item label="压耗计算">
                        <el-input class="input" v-model="pa1">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="140px">
                    <el-form-item label="300转读数">
                        <el-input class="input" v-model="params.O3_300">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="600转读数">
                        <el-input class="input" v-model="params.O3_600">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆内径">
                        <el-input class="input" v-model="params.d3_inner">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ3_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q3_innner">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱长度">
                        <el-input class="input" v-model="params.L3_zuanzhu">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井眼直径">
                        <el-input class="input" v-model="params.dh3">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="幂律流体环空">
                        <el-button type="primary" icon="el-icon-menu" @click="calc4">计算</el-button>
                    </el-form-item>
                    <el-form-item label="压耗计算">
                        <el-input class="input" v-model="pa2">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { DrillingpipePressure1 } from '../../../api/index';
import { DrillingpipePressure2 } from '../../../api/index';
import { DrillingpipePressure3 } from '../../../api/index';
import { DrillingpipePressure4 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                O_300: 60,
                O_600: 100,
                d_inner: 129,
                ρ_d: 1.4,
                Q_innner: 18,

                O1_300: 60,
                O1_600: 100,
                d1_inner: 129,
                ρ1_d: 1.5,
                Q1_innner: 18,

                O2_300: 52,
                O2_600: 78,
                d2_inner: 129,
                ρ2_d: 1.5,
                Q2_innner: 18,
                L2_zuanzhu: 1000,
                dh2: 219,

                 O3_300: 58,
                O3_600: 72,
                d3_inner: 129,
                ρ3_d: 1.4,
                Q3_innner: 18,
                L3_zuanzhu: 1500,
                dh3: 219,

              
            },
            pi_bin: 0,
            pi_pow: 0,
            pa1: 0,
            pa2: 0
        };
    },
    methods: {
        calc1() {
            DrillingpipePressure1({
                O_300: this.params.O_300,
                O_600: this.params.O_600,
                d_inner: this.params.d_inner,
                ρ_d: this.params.ρ_d,
                Q_innner: this.params.Q_innner
            })
                .then((res) => {
                    console.log(res);
                    this.pi_bin = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            DrillingpipePressure2({
                O1_300: this.params.O1_300,
                O1_600: this.params.O1_600,
                d1_inner: this.params.d1_inner,
                ρ1_d: this.params.ρ1_d,
                Q1_innner: this.params.Q1_innner
            })
                .then((res) => {
                    console.log(res);
                    this.pi_pow = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            DrillingpipePressure3({
                O2_300: this.params.O2_300,
                O2_600: this.params.O2_600,
                d2_inner: this.params.d2_inner,
                ρ2_d: this.params.ρ2_d,
                Q2_innner: this.params.Q2_innner,
                L2_zuanzhu: this.params.L2_zuanzhu,
                dh2: this.params.dh2
            })
                .then((res) => {
                    console.log(res);
                    this.pa1 = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc4: function () {
            DrillingpipePressure4({
                O3_300: this.params.O3_300,
                O3_600: this.params.O3_600,
                d3_inner: this.params.d3_inner,
                ρ3_d: this.params.ρ3_d,
                Q3_innner: this.params.Q3_innner,
                L3_zuanzhu: this.params.L3_zuanzhu,
                dh3: this.params.dh3
            })
                .then((res) => {
                    console.log(res);
                    this.pa2 = res.content;
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
<template>
    <div>
        <span>管柱计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="8">
                <el-form label-width="120px">
                    <el-form-item label="弹性模量">
                        <el-input class="input" v-model="params.E3">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="惯性矩">
                        <el-input class="input" v-model="params.I3">
                            <template slot="append">m4</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻铤线浮重">
                        <el-input class="input" v-model="params.qm3">
                            <template slot="append">kN/m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井斜角">
                        <el-input class="input" v-model="params.a3">
                            <template slot="append">°</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="视半径">
                        <el-input class="input" v-model="params.r3">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="正弦屈曲">
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="临界载荷">
                        <el-input class="input" v-model="F_sin">
                            <template slot="append">N</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="120px">
                    <el-form-item label="弹性模量">
                        <el-input class="input" v-model="params.E1">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="惯性矩">
                        <el-input class="input" v-model="params.I1">
                            <template slot="append">m4</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻铤线浮重">
                        <el-input class="input" v-model="params.qm1">
                            <template slot="append">kN/m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井斜角">
                        <el-input class="input" v-model="params.a1">
                            <template slot="append">°</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="视半径">
                        <el-input class="input" v-model="params.r1">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="螺旋屈曲">
                        <el-button type="primary" icon="el-icon-menu" @click="calc2" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="临界载荷">
                        <el-input class="input" v-model="F_crit">
                            <template slot="append">N</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="120px">
                    <el-form-item label="井眼直径">
                        <el-input class="input" v-model="params.Dh">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱直径">
                        <el-input class="input" v-model="params.Dc">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="视半径计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc3" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="视半径">
                        <el-input class="input" v-model="r2">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="8">
                <el-form label-width="120px">
                    <el-form-item label="钻铤外径">
                        <el-input class="input" v-model="params.Dco">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻铤内径">
                        <el-input class="input" v-model="params.Dci">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="惯性矩计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc4" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻铤惯性矩">
                        <el-input class="input" v-model="I2">
                            <template slot="append">m4</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="170px">
                    <el-form-item label="钻杆到接头一半长度">
                        <el-input class="input" v-model="params.L">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井眼曲率较大处下部拉力">
                        <el-input class="input" v-model="params.T">
                            <template slot="append">N</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="弹性模量">
                        <el-input class="input" v-model="params.E">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆外径">
                        <el-input class="input" v-model="params.D">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="最大弯曲应力">
                        <el-input class="input" v-model="params.Ob">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆惯性矩">
                        <el-input class="input" v-model="params.I_zuangan">
                            <template slot="append">m4</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具最大下入">
                        <el-button type="primary" icon="el-icon-menu" @click="calc5" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="曲率">
                        <el-input class="input" v-model="C">
                            <template slot="append">°/30m</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>

            <el-col :span="8">
                <el-form label-width="160px">
                    <el-form-item label="钻具内径">
                        <el-input class="input" v-model="params.D_Izuangan">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具外径">
                        <el-input class="input" v-model="params.D_Ozuangan">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.m">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具长度">
                        <el-input class="input" v-model="params.L_zuangan">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="下入钻具所受浮力计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc6" style="margin-left: 0px">计算</el-button>
                    </el-form-item>

                    <el-form-item label="所受浮力">
                        <el-input class="input" v-model="BF">
                            <template slot="append">N</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { DrillPipeMechanics1 } from '../../../api/index';
import { DrillPipeMechanics2 } from '../../../api/index';
import { DrillPipeMechanics3 } from '../../../api/index';
import { DrillPipeMechanics4 } from '../../../api/index';
import { DrillPipeMechanics5 } from '../../../api/index';
import { DrillPipeMechanics6 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                E3: 2880000,
                I3: 0.012,
                qm3: 560,
                a3: 20,
                r3: 0.045,

                E1: 2880000,
                I1: 0.012,
                qm1: 560,
                a1: 20,
                r1: 0.045,

                Dh: 0.219,
                Dc: 0.129,

                Dco: 0.152,
                Dci: 0.057,

                L: 3.5,
                T: 160,
                E: 2880000,
                D: 0.167,
                Ob:60,
                I_zuangan: 0.33,

                D_Izuangan: 0.129,
                D_Ozuangan: 0.135,
                m: 1.5,
                L_zuangan: 600
            },
            F_sin: 0,
            F_crit: 0,
            r2: 0,
            I2: 0,
            C: 0,
            BF: 0
        };
    },
    methods: {
        calc1() {
            DrillPipeMechanics1({
                E3: this.params.E3,
                I3: this.params.I3,
                qm3: this.params.qm3,
                a3: this.params.a3,
                r3: this.params.r3
            })
                .then((res) => {
                    console.log(res);
                    this.F_sin = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            DrillPipeMechanics2({
                E1: this.params.E1,
                I1: this.params.I1,
                qm1: this.params.qm1,
                a1: this.params.a1,
                r1: this.params.r1
            })
                .then((res) => {
                    console.log(res);
                    this.F_crit = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            DrillPipeMechanics3({
                Dh: this.params.Dh,
                Dc: this.params.Dc
            })
                .then((res) => {
                    console.log(res);
                    this.r2 = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc4: function () {
            DrillPipeMechanics4({
                Dco: this.params.Dco,
                Dci: this.params.Dci
            })
                .then((res) => {
                    console.log(res);
                    this.I2 = res.content.toFixed(6);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc5: function () {
            DrillPipeMechanics5({
                L: this.params.L,
                T: this.params.T,
                E: this.params.E,
                D: this.params.D,
                Ob: this.params.Ob,
                I_zuangan: this.params.I_zuangan
            })
                .then((res) => {
                    console.log(res);
                    this.C = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc6: function () {
            DrillPipeMechanics6({
                D_Izuangan: this.params.D_Izuangan,
                D_Ozuangan: this.params.D_Ozuangan,
                m: this.params.m,
                L_zuangan: this.params.L_zuangan
            })
                .then((res) => {
                    console.log(res);
                    this.BF = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
 
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
</style>
<template>
    <div>
        <span>钻头水力参数计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρd">
                            <template slot="append">g/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="喷嘴总面积">
                        <el-input class="input" v-model="params.A_j">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Q_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻头压降">
                        <el-input class="input" v-model="pb9">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px"> 
                    <el-form-item label="循环压耗">
                        <el-input class="input" v-model="params.p_cs">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻头压降">
                        <el-input class="input" v-model="params.p1_b">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc2" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻井泵工作压力">
                        <el-input class="input" v-model="p_s1">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Q1_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="喷嘴面积">
                        <el-input class="input" v-model="params.A1_j">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc3" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="喷射速度计算">
                        <el-input class="input" v-model="v_j">
                            <template slot="append">m/s</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Q2_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="喷嘴面积">
                        <el-input class="input" v-model="params.A2_j">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ2_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc4" >计算</el-button>
                    </el-form-item>

                    <el-form-item label="射流冲击力">
                        <el-input class="input" v-model="F_j">
                            <template slot="append">N</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Q3_d">
                            <template slot="append">g/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="喷嘴总面积">
                        <el-input class="input" v-model="params.A3_j">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ3_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc5" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻头水功率">
                        <el-input class="input" v-model="Pb2">
                            <template slot="append">kw</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="循环压耗">
                        <el-input class="input" v-model="params.p2_cs">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻头压降">
                        <el-input class="input" v-model="params.p2_b">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Qd_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc6" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻井泵实发水功率">
                        <el-input class="input" v-model="pp">
                            <template slot="append">kw</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>

            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Q4_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="喷嘴面积">
                        <el-input class="input" v-model="params.A4_j">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ4_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井底面积">
                        <el-input class="input" v-model="params.Ab">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc7" >计算</el-button>
                    </el-form-item>

                    <el-form-item label="钻头单位面积水功率">
                        <el-input class="input" v-model="Pbs">
                            <template slot="append">W/mm2</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>

            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井泵排量">
                        <el-input class="input" v-model="params.Q5_d">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="喷嘴面积">
                        <el-input class="input" v-model="params.A5_j">
                            <template slot="append">mm2</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ5_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="实发水功率">
                        <el-input class="input" v-model="params.pp1">
                            <template slot="append">kw</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc8" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻井泵水功率利用率">
                        <el-input class="input" v-model="n">
                            <template slot="append"></template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { DrillBitParameter1 } from '../../../api/index';
import { DrillBitParameter2 } from '../../../api/index';
import { DrillBitParameter3 } from '../../../api/index';
import { DrillBitParameter4 } from '../../../api/index';
import { DrillBitParameter5 } from '../../../api/index';
import { DrillBitParameter6 } from '../../../api/index';
import { DrillBitParameter7 } from '../../../api/index';
import { DrillBitParameter8 } from '../../../api/index';
var data = [];
export default {
    data() {
        return {
            params: {
                ρd: 1.5,
                A_j: 225,
                Q_d: 20,

                p_cs: 3.5,
                p1_b: 4.5,

                Q1_d: 20,
                A1_j: 225,

                Q2_d: 20,
                A2_j: 225,
                ρ2_d: 1.5,

                ρ3_d: 1.5,
                A3_j: 225,
                Q3_d: 20,

                p2_cs: 3.5,
                p2_b: 4,
                Qd_d: 20,

                Q4_d: 20,
                A4_j: 225,
                ρ4_d: 1.5,
                Ab: 600,

                Q5_d: 18,
                A5_j: 225,
                ρ5_d: 1.5,
                pp1: 150
            },
            pb9: 0,
            p_s1: 0,
            v_j: 0,
            F_j: 0,
            Pb2: 0,
            pp: 0,
            Pbs: 0,
            n: 0
        };
    },
    methods: {
        calc1() {
            DrillBitParameter1({
                ρd: this.params.ρd,
                A_j: this.params.A_j,
                Q_d: this.params.Q_d
            })
                .then((res) => {
                    console.log(res);
                    this.pb9 = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            DrillBitParameter2({
                p1_b: this.params.p1_b,
                p_cs: this.params.p_cs
            })
                .then((res) => {
                    console.log(res);
                    this.p_s1 = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function() {
            DrillBitParameter3({
                Q1_d: this.params.Q1_d,
                A1_j: this.params.A1_j,
               
            })
                .then((res) => {
                    console.log(res);
                    this.v_j = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc4: function() {
            DrillBitParameter4({
                Q2_d: this.params.Q2_d,
                A2_j: this.params.A2_j,
                ρ2_d: this.params.ρ2_d
            })
                .then((res) => {
                    console.log(res);
                    this.F_j = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc5: function() {
            DrillBitParameter5({
                ρ3_d: this.params.ρ3_d,
                A3_j: this.params.A3_j,
               Q3_d: this.params.Q3_d
            })
                .then((res) => {
                    console.log(res);
                    this.Pb2 = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc6: function() {
            DrillBitParameter6({
                p2_cs: this.params.p2_cs,
                p2_b: this.params.p2_b,
                Qd_d: this.params.Qd_d,
            })
                .then((res) => {
                    console.log(res);
                    this.pp = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc7: function() {
            DrillBitParameter7({
                ρ4_d: this.params.ρ4_d,
                A4_j: this.params.A4_j,
                 Q4_d: this.params.Q4_d,
                  Ab: this.params.Ab
               
            })
                .then((res) => {
                    console.log(res);
                    this.Pbs = res.content.toFixed(2);
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc8: function() {
            DrillBitParameter8({
                ρ5_d: this.params.ρ5_d,
                A5_j: this.params.A5_j, 
                Q5_d: this.params.Q5_d,
                pp1: this.params.pp1
               
            })
                .then((res) => {
                    console.log(res);
                    this.n = res.content.toFixed(2);
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
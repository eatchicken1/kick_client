<template>
    <div>
        <span>井控计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="200px">
                    <el-form-item label="新打开油气层顶部深度">
                        <el-input class="input" v-model="params.Ho">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="开泵循环时钻头所在深度">
                        <el-input class="input" v-model="params.Hd">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="循环气测值明显升高时间">
                        <el-input class="input" v-model="params.T1">
                            <template slot="append">min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="开泵时间">
                        <el-input class="input" v-model="params.T0">
                            <template slot="append">min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻头位置处井深的迟到时间">
                        <el-input class="input" v-model="params.Tde">
                            <template slot="append">min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="静止时间">
                        <el-input class="input" v-model="params.Ts">
                            <template slot="append">h</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="油气上窜速度">
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="油气上窜速度">
                        <el-input class="input" v-model="upwardflowspeed">
                            <template slot="append">m/h</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="200px">
                    <el-form-item label="套压">
                        <el-input class="input" v-model="params.pt">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="正常钻进时的排量">
                        <el-input class="input" v-model="params.Q1">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="泵压">
                        <el-input class="input" v-model="params.Ps">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="小排量循环时的排量">
                        <el-input class="input" v-model="params.Q2">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="关井立管压力">
                        <el-button type="primary" icon="el-icon-menu" @click="calc2" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="关井立管压力">
                        <el-input class="input" v-model="shutin_riserpressure">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="200px">
                    <el-form-item label="立管压力">
                        <el-input class="input" v-model="params.pd">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.rhom">
                            <template slot="append">g/cm³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井深">
                        <el-input class="input" v-model="params.h">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="附加密度值">
                        <el-input class="input" v-model="params.Sk">
                            <template slot="append">g/cm³</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="压井密度计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc3" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="压井密度">
                        <el-input class="input" v-model="kickwell_density">
                            <template slot="append">g/cm³</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="200px">
                    <el-form-item label="立管压力">
                        <el-input class="input" v-model="params.pd">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="初始循环压力">
                        <el-input class="input" v-model="params.pcm">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="初始立管总压力计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc4" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="初始立管总压力">
                        <el-input class="input" v-model="InitialStandPipe_TotalPressure">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="8">
                <el-form label-width="220px">
                    <el-form-item label="初始循环压力">
                        <el-input class="input" v-model="params.pcm">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="压井密度">
                        <el-input class="input" v-model="params.rhomk">
                            <template slot="append">g/cm³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.rhom">
                            <template slot="append">g/cm³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="终了立管总压力计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc5" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="终了立管总压力计算">
                        <el-input class="input" v-model="FinalStandPipe_TotalPressure">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="220px">
                    <el-form-item label="钻柱内容积">
                        <el-input class="input" v-model="params.Vd">
                            <template slot="append">m³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井深">
                        <el-input class="input" v-model="params.h">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="重钻井液到达钻头所需时间计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc6" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="重钻井液到达钻头所需时间计算">
                        <el-input class="input" v-model="Reach_BitTime">
                            <template slot="append">s</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="220px">
                    <el-form-item label="钻柱外容积(环空体积)">
                        <el-input class="input" v-model="params.Va">
                            <template slot="append">m³</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井深">
                        <el-input class="input" v-model="params.h">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="重钻井液到达钻头所需时间计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc7" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="重钻井液到达钻头所需时间计算">
                        <el-input class="input" v-model="Reach_SurfaceTime">
                            <template slot="append">s</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { wellcontrol1 } from '../../../api/index';
import { wellcontrol2 } from '../../../api/index';
import { wellcontrol3 } from '../../../api/index';
import { wellcontrol4 } from '../../../api/index';
import { wellcontrol5 } from '../../../api/index';
import { wellcontrol6 } from '../../../api/index';
import { wellcontrol7 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                Ho: 125,
                Hd: 1000,
                T1: 1000,
                T0: 1000,
                Tde: 1000,
                Ts: 1000,

                pt: 50,
                Q1: 30,
                Ps: 50,
                Q2: 24,

                pd: 125,
                rhom: 1000,
                h: 1000,
                Sk: 1000,

                pd: 50,
                pcm: 30,

                pcm: 50,
                rhomk: 30,
                rhom: 30,

                Vd: 50,
                Q: 30,
                h: 30,

                Va: 50,
                Q: 30,
                h: 30
            },
            upwardflowspeed: 0,
            shutin_riserpressure: 0,
            kickwell_density: 0,
            InitialStandPipe_TotalPressure: 0,
            FinalStandPipe_TotalPressure: 0,
            Reach_BitTime: 0,
            Reach_SurfaceTime: 0
        };
    },
    methods: {
        calc1() {
            wellcontrol1({
                Ho: this.params.Ho,
                Hd: this.params.Hd,
                T1: this.params.T1,
                T0: this.params.T0,
                Tde: this.params.Tde,
                Ts: this.params.Ts
            })
                .then((res) => {
                    console.log(res);
                    this.upwardflowspeed = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            wellcontrol2({
                pt: this.params.pt,
                Q1: this.params.Q1,
                Ps: this.params.Ps,
                Q2: this.params.Q2
            })
                .then((res) => {
                    console.log(res);
                    this.shutin_riserpressure = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            wellcontrol3({
                pd: this.params.pd,
                rhom: this.params.rhom,
                h: this.params.h,
                Sk: this.params.Sk
            })
                .then((res) => {
                    console.log(res);
                    this.kickwell_density = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc4: function () {
            wellcontrol4({
                pd: this.params.pd,
                pcm: this.params.pcm
            })
                .then((res) => {
                    console.log(res);
                    this.InitialStandPipe_TotalPressure = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc5: function () {
            wellcontrol5({
                pcm: this.params.pcm,
                rhomk: this.params.rhomk,
                rhom: this.params.rhom
            })
                .then((res) => {
                    console.log(res);
                    this.FinalStandPipe_TotalPressure = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc6: function () {
            wellcontrol6({
                Vd: this.params.Vd,
                Q: this.params.Q,
                h: this.params.h
            })
                .then((res) => {
                    console.log(res);
                    this.Reach_BitTime = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc7: function () {
            wellcontrol7({
                Va: this.params.Va,
                Q: this.params.Q,
                h: this.params.h
            })
                .then((res) => {
                    console.log(res);
                    this.Reach_SurfaceTime = res.content;
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
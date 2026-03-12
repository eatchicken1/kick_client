<template>
    <div>
        <span>解卡计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="8">
                <el-form label-width="200px">
                    <el-form-item label="钻杆连续提升时平均伸长量">
                        <el-input class="input" v-model="params.e">
                            <template slot="append">cm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="管体截面积">
                        <el-input class="input" v-model="params.F">
                            <template slot="append">c㎡</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆连续提升时平均拉力">
                        <el-input class="input" v-model="params.P">
                            <template slot="append">t(吨)</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="卡点位置计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="卡点深度">
                        <el-input class="input" v-model="StickPoint_Depth">
                            <template slot="append">N</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="200px">
                    <el-form-item label="卡点深度">
                        <el-input class="input" v-model="params.pf">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钢材的剪切系数">
                        <el-input class="input" v-model="params.g">
                            <template slot="append">kg/c㎡</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="安全系数">
                        <el-input class="input" v-model="params.s">
                            <template slot="append"></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆外径">
                        <el-input class="input" v-model="params.d">
                            <template slot="append">°</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钢材的屈服强度">
                        <el-input class="input" v-model="params.ts">
                            <template slot="append">kg/c㎡</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻杆允许扭转圈数">
                        <el-button type="primary" icon="el-icon-menu" @click="calc2" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻杆允许扭转圈数">
                        <el-input class="input" v-model="DrillingPipeAllowedTorsionTurns_Number">
                            <template slot="append">无量纲</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="8">
                <el-form label-width="200px">
                    <el-form-item label="钻头直径">
                        <el-input class="input" v-model="params.D">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻铤或钻杆外径">
                        <el-input class="input" v-model="params.d1">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="粘卡井段钻柱长度">
                        <el-input class="input" v-model="params.H">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="附加系数">
                        <el-input class="input" v-model="params.K">
                            <template slot="append">无量纲</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻铤或钻杆内径">
                        <el-input class="input" v-model="params.d2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="预留顶替量">
                        <el-input class="input" v-model="params.Q3">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="解卡剂用量">
                        <el-button type="primary" icon="el-icon-menu" @click="calc3" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="解卡剂用量">
                        <el-input class="input" v-model="StuckReleasedAgent_Amount">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8">
                <el-form label-width="200px">
                    <el-form-item label="循环泵压">
                        <el-input class="input" v-model="params.p1">
                            <template slot="append">MPa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井内钻井液密度">
                        <el-input class="input" v-model="params.rho1">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="解卡剂密度">
                        <el-input class="input" v-model="params.rho2">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="解卡剂在钻柱内的液柱高度">
                        <el-input class="input" v-model="params.h">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="注解卡剂最高泵压">
                        <el-button type="primary" icon="el-icon-menu" @click="calc4" style="margin-left: 0px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="注解卡剂最高泵压">
                        <el-input class="input" v-model="InjectionMaximumPumpPressure_StuckReleasedAgent">
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
import { stuckreleased1 } from '../../../api/index';
import { stuckreleased2 } from '../../../api/index';
import { stuckreleased3 } from '../../../api/index';
import { stuckreleased4 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                e: 125,
                F: 1000,
                P: 1000,

                pf: 3000,
                g: 800000,
                s: 1.5,
                d: 50,
                ts: 24,

                D: 215.9,
                d1: 0.127,
                H: 100,
                K: 1.2,
                d2: 0.1,
                Q3: 1000,

                p1: 50,
                rho1: 30,
                rho2: 30,
                h: 30
            },
            StickPoint_Depth: 0,
            DrillingPipeAllowedTorsionTurns_Number: 0,
            StuckReleasedAgent_Amount: 0,
            InjectionMaximumPumpPressure_StuckReleasedAgent: 0
        };
    },
    methods: {
        calc1() {
            stuckreleased1({
                e: this.params.e,
                F: this.params.F,
                P: this.params.P
            })
                .then((res) => {
                    console.log(res);
                    this.StickPoint_Depth = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            stuckreleased2({
                pf: this.params.pf,
                g: this.params.g,
                s: this.params.s,
                d: this.params.d,
                ts: this.params.ts
            })
                .then((res) => {
                    console.log(res);
                    this.DrillingPipeAllowedTorsionTurns_Number = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            stuckreleased3({
                D: this.params.Dh,
                d1: this.params.Dc,
                H: this.params.H,
                K: this.params.K,
                d2: this.params.d2,
                Q3: this.params.Q3
            })
                .then((res) => {
                    console.log(res);
                    this.StuckReleasedAgent_Amount = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc4: function () {
            stuckreleased4({
                p1: this.params.p1,
                rho1: this.params.rho1,
                rho2: this.params.rho2,
                h: this.params.h,        
            })
                .then((res) => {
                    console.log(res);
                    this.InjectionMaximumPumpPressure_StuckReleasedAgent = res.content;
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
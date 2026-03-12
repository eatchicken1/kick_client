<template>
    <div>
        <span>钻井液混合计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井液原体积">
                        <el-input class="input" v-model="params.V_1">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="原钻井液密度">
                        <el-input class="input" v-model="params.ρ_0">
                            <template slot="append">kg/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="重晶石密度">
                        <el-input class="input" v-model="params.ρ_1">
                            <template slot="append">kg/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="欲配置钻井液密度">
                        <el-input class="input" v-model="params.ρ_2">
                            <template slot="append">kg/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="加重钻井液">
                        <el-button type="primary" icon="el-icon-menu" @click="calc1">计算</el-button>
                    </el-form-item>
                    <el-form-item label="所需重晶石重量">
                        <el-input class="input" v-model="G_s">
                            <template slot="append">kg</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="钻井液原体积">
                        <el-input class="input" v-model="params.V1">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="水的密度">
                        <el-input class="input" v-model="params.ρ1">
                            <template slot="append">kg/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="原钻井液密度">
                        <el-input class="input" v-model="params.ρ0">
                            <template slot="append">kg/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="降低后钻井液密度">
                        <el-input class="input" v-model="params.ρ2">
                            <template slot="append">kg/m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="稀释钻井液">
                        <el-button type="primary" icon="el-icon-menu" @click="calc2">计算</el-button>
                    </el-form-item>
                    <el-form-item label="所需水的量">
                        <el-input class="input" v-model="G_w">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="粘土密度">
                        <el-input class="input" v-model="params.ρc">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="水的密度">
                        <el-input class="input" v-model="params.ρw">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="欲配制密度">
                        <el-input class="input" v-model="params.ρm">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="欲配制钻井液体积">
                        <el-input class="input" v-model="params.vm">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="配置钻井液">
                        <el-button type="primary" icon="el-icon-menu" @click="calc3">计算</el-button>
                    </el-form-item>
                    <el-form-item label="所需粘土的量">
                        <el-input class="input" v-model="W">
                            <template slot="append">t</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form label-width="160px">
                    <el-form-item label="第一种钻井液密度">
                        <el-input class="input" v-model="params.ρ3">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="第二种钻井液密度">
                        <el-input class="input" v-model="params.ρ4">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="第一种钻井液体积">
                        <el-input class="input" v-model="params.V3">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="第二种钻井液体积">
                        <el-input class="input" v-model="params.V4">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液混合后密度">
                        <el-button type="primary" icon="el-icon-menu" @click="calc4">计算</el-button>
                    </el-form-item>
                    <el-form-item label="混合后钻井液密度">
                        <el-input class="input" v-model="ρ5">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { DrillingfluidMixture1 } from '../../../api/index';
import { DrillingfluidMixture2 } from '../../../api/index';
import { DrillingfluidMixture3 } from '../../../api/index';
import { DrillingfluidMixture4 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                V_1: 500,
                ρ_0: 1400,
                ρ_1: 4200,
                ρ_2: 1800,

                V1: 100,
                ρ1: 1000,
                ρ0: 1400,
                ρ2: 1200,

                ρc: 2,
                ρw: 1,
                ρm: 1.4,
                vm: 50,

                ρ3: 1.8,
                ρ4: 1.4,
                V3: 50,
                V4: 80
            },
            G_s: 0,
            G_w: 0,
            W: 0,
            ρ5: 0
        };
    },
    methods: {
        calc1() {
            DrillingfluidMixture1({
                V_1: this.params.V_1,
                ρ_0: this.params.ρ_0,
                ρ_1: this.params.ρ_1,
                ρ_2: this.params.ρ_2
            })
                .then((res) => {
                    console.log(res);
                    this.G_s = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            DrillingfluidMixture2({
                V1: this.params.V1,
                ρ1: this.params.ρ1,
                ρ0: this.params.ρ0,
                ρ2: this.params.ρ2
            })
                .then((res) => {
                    console.log(res);
                    this.G_w = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            DrillingfluidMixture3({
                ρc: this.params.ρc,
                ρw: this.params.ρw,
                ρm: this.params.ρm,
                vm: this.params.vm
            })
                .then((res) => {
                    console.log(res);
                    this.W = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc4: function () {
            DrillingfluidMixture4({
                ρ3: this.params.ρ3,
                ρ4: this.params.ρ4,
                V3: this.params.V3,
                V4: this.params.V4
            })
                .then((res) => {
                    console.log(res);
                    this.ρ5 = res.content;
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
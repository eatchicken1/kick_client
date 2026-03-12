<template>
    <div>
        <span>井眼净化计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="7">
                <el-form label-width="160px">
                    <el-form-item label="流体类型">
                        <el-select v-model="params.fluidtype_1" @change="selectChange1" class="input">
                            <el-option label="宾汉流体" value="1"></el-option>
                            <el-option label="幂律流体" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="R600">
                        <el-input class="input" v-model="params.R600_1">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="R300">
                        <el-input class="input" v-model="params.R300_1">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="R100">
                        <el-input class="input" v-model="params.R100_1">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="R3">
                        <el-input class="input" v-model="params.R3_1">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱外径">
                        <el-input class="input" v-model="params.D1_1">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="环空直径">
                        <el-input class="input" v-model="params.D2_1">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q_1">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="岩屑密度">
                        <el-input class="input" v-model="params.ρ_s_1">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="允许最大岩屑床厚度">
                        <el-input class="input" v-model="params.h_1">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻头外径">
                        <el-input class="input" v-model="params.D_Bit_1">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="转盘转速">
                        <el-input class="input" v-model="params.N_rpm_1">
                            <template slot="append">r/min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="偏心距">
                        <el-input class="input" v-model="params._e_1">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ_l_1">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="最大机械钻速">
                        <el-button type="primary" icon="el-icon-menu" @click="calc1">计算</el-button>
                    </el-form-item>
                    <el-form-item label="最大机械钻速">
                        <el-input class="input" v-model="yx_max_ROP_1">
                            <template slot="append">m/h</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="7">
                <el-form label-width="160px">
                    <el-form-item label="流体类型">
                        <el-select v-model="params.fluidtype_2" @change="selectChange2" class="input">
                            <el-option label="宾汉流体" value="1"></el-option>
                            <el-option label="幂律流体" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="R600">
                        <el-input class="input" v-model="params.R600_2">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="R300">
                        <el-input class="input" v-model="params.R300_2">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="R100">
                        <el-input class="input" v-model="params.R100_2">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="R3">
                        <el-input class="input" v-model="params.R3_2">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱外径">
                        <el-input class="input" v-model="params.D1_2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="环空直径">
                        <el-input class="input" v-model="params.D2_2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input class="input" v-model="params.Q_2">
                            <template slot="append">L/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="岩屑密度">
                        <el-input class="input" v-model="params.ρ_s_2">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="机械钻速">
                        <el-input class="input" v-model="params.ROP_2">
                            <template slot="append">m/h</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻头外径">
                        <el-input class="input" v-model="params.D_Bit_2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="转盘转速">
                        <el-input class="input" v-model="params.N_rpm_2">
                            <template slot="append">r/min</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="偏心距">
                        <el-input class="input" v-model="params._e_2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ_l_2">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="岩屑床厚度">
                        <el-button type="primary" icon="el-icon-menu" @click="calc2">计算</el-button>
                    </el-form-item>
                    <el-form-item label="岩屑床厚度">
                        <el-input class="input" v-model="yxc_hd_2">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="7">
                <el-form label-width="160px">
                    <el-form-item label="岩屑直径">
                        <el-input class="input" v-model="params.d_rc">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="岩屑密度">
                        <el-input class="input" v-model="params.ρ_rc">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液密度">
                        <el-input class="input" v-model="params.ρ_d">
                            <template slot="append">g/cm3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="有效粘度">
                        <el-input class="input" v-model="params.μ_f">
                            <template slot="append">mPa▪s</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="岩屑沉降速度计算">
                        <el-button type="primary" icon="el-icon-menu" @click="calc3">计算</el-button>
                    </el-form-item>

                    <el-form-item label="岩屑沉降速度">
                        <el-input class="input" v-model="yx_cjsd">
                            <template slot="append">>m/s</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { WellboreClean1 } from '../../../api/index';
import { WellboreClean2 } from '../../../api/index';
import { WellboreClean3 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                R600_1: 130,
                R300_1: 75,
                R100_1: 25,
                R3_1: 7,
                D1_1: 127,
                D2_1: 215.9,
                Q_1: 32,
                ρ_s_1: 2.6,
                h_1: 30,
                D_Bit_1: 215.9,
                N_rpm_1: 120,
                _e_1: 10,
                ρ_l_1: 1.45,
                fluidtype_1: '1',

                R600_2: 130,
                R300_2: 75,
                R100_2: 25,
                R3_2: 7,
                D1_2: 127,
                D2_2: 215.9,
                Q_2: 32,
                ρ_s_2: 2.6,
                ROP_2: 15,
                D_Bit_2: 215.9,
                N_rpm_2: 120,
                _e_2: 10,
                ρ_l_2: 1.45,
                fluidtype_2: '1',

                d_rc: 5,
                ρ_rc: 2.6,
                ρ_d: 1.25,
                μ_f: 35
            },
            yxc_hd_2: 0,
            yx_max_ROP_1: 0,
            yx_cjsd: 0
        };
    },
    methods: {
        calc1() {
            WellboreClean1({
                R600: this.params.R600_1,
                R300: this.params.R300_1,
                R100: this.params.R100_1,
                R3: this.params.R3_1,
                D1: this.params.D1_1,
                D2: this.params.D2_1,
                Q: this.params.Q_1,
                ρ_s: this.params.ρ_s_1,
                h: this.params.h_1,
                D_Bit: this.params.D_Bit_1,
                N_rpm: this.params.N_rpm_1,
                _e: this.params._e_1,
                ρ_l: this.params.ρ_l_1,
                fluidtype: this.params.fluidtype_1
            })
                .then((res) => {
                    console.log(res);
                    this.yx_max_ROP_1 = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            WellboreClean2({
                R600: this.params.R600_2,
                R300: this.params.R300_2,
                R100: this.params.R100_2,
                R3: this.params.R3_2,
                D1: this.params.D1_2,
                D2: this.params.D2_2,
                Q: this.params.Q_2,
                ROP: this.params.ROP_2,
                D_Bit: this.params.D_Bit_2,
                N_rpm: this.params.N_rpm_2,
                _e: this.params._e_2,
                ρ_l: this.params.ρ_l_2,
                fluidtype: this.params.fluidtype_2
            })
                .then((res) => {
                    console.log(res);
                    this.yxc_hd_2 = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            WellboreClean3({
                d_rc1: this.params.d_rc,
                ρ_rc1: this.params.ρ_rc,
                ρ_d1: this.params.ρ_d,
                μ_f1: this.params.μ_f
            })
                .then((res) => {
                    console.log(res);
                    this.yx_cjsd = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        selectChange1(val) {
            this.params.fluidtype_1 = val;
            console.log(val)
        },
        selectChange2(val) {
            this.params.fluidtype_2 = val;
            console.log(val)
        },
    }
};
</script>

<style scoped>
.input {
    width: 200px;
}
@import url('//unpkg.com/element-plus/lib/theme-chalk/index.css');
</style>
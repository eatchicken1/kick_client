<template>
    <div>
        <span>流变参数计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6" >
                <el-form label-width="160px">
                    <el-form-item label="钻井液600转读数">
                        <el-input class="input" v-model="params.O600">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液300转读数">
                        <el-input class="input" v-model="params.O300">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液3转读数">
                        <el-input class="input" v-model="params.O3">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="环空钻井液流速">
                        <el-input class="input" v-model="params.V1">
                            <template slot="append">m/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱外径">
                        <el-input class="input" v-model="params.d">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" style="margin-left: 70px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="环空流性指数">
                        <el-input class="input" v-model="na">
                            <template slot="append">无量纲</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="环空稠度系数">
                        <el-input class="input" v-model="ka">
                            <template slot="append">Pa·s^n</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="环空有效视粘度">
                        <el-input class="input" v-model="uca">
                            <template slot="append">mPa·s</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6" >
                <el-form label-width="160px">
                    <el-form-item label="钻井液600转读数">
                        <el-input class="input" v-model="params.O600in">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻井液300转读数">
                        <el-input class="input" v-model="params.O300in">
                            <template slot="append">读数</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具内钻井液流速">
                        <el-input class="input" v-model="params.Vin">
                            <template slot="append">m/s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具内径">
                        <el-input class="input" v-model="params.din">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc2" style="margin-left: 70px">计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻具内钻井液流变指数">
                        <el-input class="input" v-model="np">
                            <template slot="append">无量纲</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具内钻井液稠度系数">
                        <el-input class="input" v-model="kp">
                            <template slot="append">Pa·s^n</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具内钻井液屈服值">
                        <el-input class="input" v-model="yp">
                            <template slot="append">Pa</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具内钻井液塑性粘度">
                        <el-input class="input" v-model="pv">
                            <template slot="append">mPa·s</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具内有效视粘度">
                        <el-input class="input" v-model="ucp">
                            <template slot="append">mPa·s</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { annularRheology1 } from '../../../api/index';
import { annularRheology2 } from '../../../api/index';

var data = [];
export default {
    data() {
        return {
            params: {
                O300: 52,
                O600: 78,
                O3: 6,
                V1: 2,
                d: 215.9,
                O300in: 60,
                O600in: 100,
                Vin: 3,
                din: 127
            },
            na: 0,
            ka: 0,
            uca: 0,
            np: 0,
            kp: 0,
            yp: 0,
            pv: 0,
            ucp: 0
        };
    },
    methods: {
        calc1() {
            annularRheology1({
                O300: this.params.O300,
                O600: this.params.O600,
                O3: this.params.O3,
                V1: this.params.V1,
                d: this.params.d
            })
                .then((res) => {
                    console.log(res);
                    this.na = res.content[0].na;
                    this.ka = res.content[0].ka;
                    this.uca = res.content[0].uca;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            annularRheology2({
                O300in: this.params.O300in,
                O600in: this.params.O600in,
                Vin: this.params.Vin,
                din: this.params.din
            })
                .then((res) => {
                    console.log(res);
                    this.np = res.content[0].np;
                    this.kp = res.content[0].kp;
                    this.yp = res.content[0].yp;
                    this.pv = res.content[0].pv;
                    this.ucp = res.content[0].ucp;
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
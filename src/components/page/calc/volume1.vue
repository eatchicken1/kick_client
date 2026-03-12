<template>
    <div>
        <span>井筒容积计算</span>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="6" :offset="2">
                <el-form label-width="120px">
                    <el-form-item label="钻柱内径">
                        <el-input class="input" v-model="params.innerDia">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱长度">
                        <el-input class="input" v-model="params.bhaLength">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc1" >计算</el-button>
                    </el-form-item>
                    <el-form-item label="钻柱容积">
                        <el-input class="input" v-model="innerVolume">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form>
                    <el-form-item label="井眼内径">
                        <el-input class="input" v-model="params.innerDia1">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具外径">
                        <el-input class="input" v-model="params.externalDia1">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻柱长度">
                        <el-input class="input" v-model="params.bhaLength1">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                      <el-form-item>
                        <el-button type="primary" icon="el-icon-menu" @click="calc2" style="margin-left:70px;">计算</el-button>
                    </el-form-item>
                    <el-form-item label="环空容积">
                        <el-input class="input" v-model="annularVolume">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="6">
                <el-form>
                    <el-form-item label="井眼直径">
                        <el-input class="input" v-model="params.Dia">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具外径">
                        <el-input class="input" v-model="params.externalDia2">
                            <template slot="append">m</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="井深长度">
                        <el-input class="input" v-model="params.wellLength2">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="钻具长度">
                        <el-input class="input" v-model="params.bhaLength2">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>   
                      <el-form-item>               
                         <el-button type="primary" icon="el-icon-menu" @click="calc3" style="margin-left:70px;">计算</el-button>
                    </el-form-item>
                    <el-form-item label="井筒容积">
                        <el-input class="input" v-model="wellboreVolume">
                            <template slot="append">m3</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//  api引入  参数传递与方法相同，不能乱设
import { volume1 } from '../../../api/index';
import { volume2 } from '../../../api/index';
import { volume3 } from '../../../api/index';
var data = [];
export default {
    data() {
        return {
            params: {
                innerDia: 444.5,
                bhaLength: 1000,
                innerDia1: 125,
                externalDia1: 10,
                bhaLength1: 100,
                Dia: 125,
                externalDia2: 10,
                wellLength2: 1000,
                bhaLength2: 100
            },
            innerVolume: 0,
            annularVolume: 0,
            wellboreVolume: 0
        };
    },
    methods: {
        calc1() {
            volume1({
                a: this.params.innerDia,
                b: this.params.bhaLength
            })
                .then((res) => {
                    console.log(res);
                    this.innerVolume = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc2: function () {
            volume2({
                a: this.params.innerDia1,
                b: this.params.externalDia1,
                c: this.params.bhaLength1
            })
                .then((res) => {
                    console.log(res);
                    this.annularVolume = res.content;
                })
                .catch((e) => {
                    console.log(e);
                    this.$message.error('请求失败');
                });
        },
        calc3: function () {
            volume3({
                a: this.params.Dia,
                b: this.params.externalDia2,
                c: this.params.wellLength2,
                d: this.params.bhaLength2
            })
                .then((res) => {
                    console.log(res);
                    this.wellboreVolume = res.content;
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
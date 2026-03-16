<template>
    <div>
        <h1 class="h1">早期溢流智能预警系统</h1>
        <el-header>西南石油大学</el-header>
        <el-divider>选择井眼</el-divider>
        <el-container>
            <el-aside width="200px">
                <el-button icon="el-icon-plus" style="font-size: 20px" @click="addHole">添加井眼</el-button>
                <el-button icon="el-icon-delete" style="font-size: 20px" type="danger" @click="deleteHole">删除井眼</el-button>
            </el-aside>
            <el-main style="height: 72vh">
                <el-col :span="4" :offset="1" v-for="item in option" :key="item.id">
                    <el-card :body-style="{ padding: '0px' }" style="height: 300px; margin-bottom: 20px">
                        <div style="padding: 14px" align="center">
                            <el-button type="text" @click="submitForm(item.id)" style="font-size: 20px; width: 100%" :id="item.id">
                                <img :src="require('../../assets/' + item.pictureName + '.jpg')" class="image" />
                                {{ item.wellName }}
                            </el-button>
                            <el-date-picker v-model="item.dateTime" type="datetime" placeholder="选择日期时间" align="right">
                            </el-date-picker>
                        </div>
                    </el-card>
                </el-col>
            </el-main>
        </el-container>
        <el-dialog title="添加井眼" :visible.sync="isAddHole" width="40%">
            <el-form ref="form" :model="Hole" label-width="120px" label-position="right" :inline="true">
                <el-form-item label="工监系统井名">
                    <el-input v-model="Hole.wellName" placeholder="输入井名" style="width: 220px"> </el-input>
                </el-form-item>
                <el-form-item label="开始计算时间">
                    <el-date-picker v-model="Hole.dateTime" type="datetime" placeholder="选择日期时间" align="right"></el-date-picker>
                </el-form-item>
                <el-form-item label="选择钻进方式">
                    <el-select v-model="Hole.MoveCondition" style="width: 220px">
                        <el-option label="旋转钻进" value="旋转钻进"></el-option>
                        <el-option label="复合钻进" value="复合钻进"></el-option>
                        <el-option label="滑动钻进" value="滑动钻进"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="套管段摩擦系数">
                    <el-input v-model="Hole.CasingFc" placeholder="套管段摩擦系数" style="width: 220px"></el-input>
                </el-form-item>
                <el-form-item label="裸眼段摩擦系数">
                    <el-input v-model="Hole.HoleFc" placeholder="裸眼段摩擦系数" style="width: 220px"></el-input>
                </el-form-item>
                <el-form-item label="游动系统重量">
                    <el-input v-model="Hole.swimG" placeholder="游动系统重量" style="width: 220px"><template slot="append">kN</template></el-input>
                </el-form-item>
                 <el-form-item label="特殊工具压耗">
                    <el-input v-model="Hole.Loss" placeholder="特殊工具压耗" style="width: 220px"><template slot="append">kN</template></el-input>
                </el-form-item>
                 <el-form-item label="井底扭矩">
                    <el-input v-model="Hole.tor" placeholder="井底扭矩" style="width: 220px"><template slot="append">kN·m</template></el-input>
                </el-form-item>
                <el-form-item label="钻井液粘滞力">
                    <el-radio-group v-model="Hole.isViscousEffect">
                        <el-radio label="true">考虑</el-radio>
                        <el-radio label="false">不考虑</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="选择井名图片">
                    <el-radio-group v-model="Hole.pictureName" @change="radioChange">
                        <el-radio-button v-for="(o, index) in 9" :key="o" :label="index"><img :src="require('../../assets/' + index + '.jpg')" style="width: 100px; height: 100px" /></el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd">取 消</el-button>
                <el-button type="primary" @click="saveHole">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="删除井眼" :visible.sync="isDeleteHole" width="30%">
            <el-form ref="form" :model="Hole" label-width="120px" label-position="right">
                <el-form-item label="选择井号">
                    <el-checkbox-group v-model="checkbox" @change="CheckedChange">
                        <el-checkbox v-for="item in option" :label="item.wellName" :key="item.id">{{ item.wellName }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelDelete">取 消</el-button>
                <el-button type="danger" @click="isDelHole">删 除</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchApidata } from '../../api/index';
export default {
    name: 'HoleSelect',
    data() {
        return {
            option: [],
            isAddHole: false,
            isDeleteHole: false,
            Hole: { pictureName: '0', CasingFc: 0.2, HoleFc: 0.2, swimG: 470, Loss: 5,tor: 10,dateTime: new Date(), MoveCondition: '旋转钻进', isViscousEffect: 'true' },
            checkbox: [],
            deleteHoleList: [],
            wellNumber: 0
        };
    },
    mounted() {
        this.getHoleList();
    },
    methods: {
        async getHoleList() {
            var data = {};
            const res = await fetchApidata('HoleInfo/GetHoleInfoLsit', data, 'get');
            this.option = res.content;
        },
        addHole() {
            this.isAddHole = true;
        },
        async saveHole() {
            this.Hole.id = '00000000-0000-0000-0000-000000000000';
            this.Hole.pictureName = this.Hole.pictureName.toString();
            this.Hole.CasingFc = parseFloat(this.Hole.CasingFc);
            this.Hole.HoleFc = parseFloat(this.Hole.HoleFc);
            this.Hole.swimG = parseFloat(this.Hole.swimG);
             this.Hole.Loss = parseFloat(this.Hole.Loss);
              this.Hole.tor = parseFloat(this.Hole.tor);
            if (this.Hole.isViscousEffect == "true") {
                this.Hole.isViscousEffect = true;
            } else {
                this.Hole.isViscousEffect = false;
            }
            const res = await fetchApidata('HoleInfo/SaveHoleInfo', this.Hole, 'post');
            this.isAddHole = false;
            this.option = res.content;
            this.getHoleList();
        },
        cancelAdd() {
            this.isAddHole = false;
        },
        async submitForm(val) {
            for (var i = 0; i < this.option.length; i++) {
                if (this.option[i].id == val) {
                    this.wellNumber = i;
                }
            }
            const res = await fetchApidata('HoleInfo/GetHoleInfo', { wellname: this.option[this.wellNumber].wellName }, 'get');
            const data = {
                jh: res.content.wellName,
                StartTime: res.content.dateTime,
                MoveCondition: res.content.moveCondition,
                CasingFc: res.content.casingFc,
                HoleFc: res.content.holeFc,
                swimG: res.content.swimG,
                tor:res.content.tor,
                 Loss: res.content.Loss,
                isViscousEffect: res.content.isViscousEffect
            };
            this.$store.commit('getBaseData', data);
            this.$router.push('/');
        },
        radioChange(val) {
            this.Hole.pictureName = val;
        },
        deleteHole() {
            this.isDeleteHole = true;
        },
        cancelDelete() {
            this.isDeleteHole = false;
        },
        async isDelHole() {
            for (var j = 0; j < this.option.length; j++) {
                for (var i = 0; i < this.deleteHoleList.length; i++) {
                    if (this.deleteHoleList[i] == this.option[j].wellName) {
                        await fetchApidata('HoleInfo/DeleteHole', { id: this.option[j].id }, 'get');
                    }
                }
            }
            this.isDeleteHole = false;
            this.getHoleList();
        },
        CheckedChange(val) {
            this.deleteHoleList = [];
            for (var j = 0; j < val.length; j++) {
                this.deleteHoleList.push([val[j]]);
            }
        }
    }
};
</script>

<style scoped>
.el-divider__text {
    /* background-color: #eee; */
    font-size: 20px;
}
.image {
    width: 100%;
    height: 180px;
    display: block;
    margin-bottom: 10px;
}
.el-header {
    text-align: center;
    line-height: 60px;
    font-size: 25px;
}
.h1 {
    margin-top: 5%;
    text-align: center;
    line-height: 60px;
    font-size: 50px;
}
.el-main {
    color: #333;
    text-align: center;
}
.el-aside {
    text-align: center;
    line-height: 200px;
}
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
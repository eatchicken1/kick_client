<template>
    <el-card>
        <el-row>
            <el-col :span="24">
                <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="add">添加</el-button>
                <el-table :data="threePressureProfileList" style="margin: 10px 0 5px 0">
                    <el-table-column prop="tvd" label="深度（m）" />
                    <el-table-column prop="formationName" label="层位" />
                    <el-table-column prop="porePressureGrad" label="孔隙压力梯度（g/cm³）" />
                    <el-table-column prop="fracturePressureGrad" label="破裂压力梯度（g/cm³）" />
                    <el-table-column prop="collapsePressureGrad" label="坍塌压力梯度（g/cm³）" />
                    <el-table-column prop="porePressure" label="孔隙压力（MPa）" />
                    <el-table-column prop="fracturePressure" label="破裂压力（MPa）" />
                    <el-table-column prop="collapsePressure" label="坍塌压力（MPa）" />
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button size="mini" icon="el-icon-edit" @click="edit(scope.$index, scope.row)">编辑</el-button>
                            <el-button
                                style="margin: 0 0 0 15px"
                                size="mini"
                                type="danger"
                                icon="el-icon-delete"
                                @click="delete2(scope.$index, scope.row)"
                                >删除</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog :title="dialogTitile" :visible.sync="isShowDilog" width="50%">
            <el-form ref="form" :model="threePressureProfile" label-width="120px" label-position="right">
                <el-form-item label="深度">
                    <el-input v-model="threePressureProfile.tvd" placeholder="深度">
                        <template slot="append">m</template>
                    </el-input> </el-form-item
                ><el-form-item label="层位">
                    <el-input v-model="threePressureProfile.formationName" placeholder="层位"> </el-input>
                </el-form-item>
                <el-form-item label="孔隙压力梯度">
                    <el-input v-model="threePressureProfile.porePressureGrad" placeholder="孔隙压力梯度">
                        <template slot="append">g/cm³</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="破裂压力梯度">
                    <el-input v-model="threePressureProfile.fracturePressureGrad" placeholder="破裂压力梯度">
                        <template slot="append">g/cm³</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="坍塌压力梯度">
                    <el-input v-model="threePressureProfile.collapsePressureGrad" placeholder="坍塌压力梯度">
                        <template slot="append">g/cm³</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isShowDilog = false">取 消</el-button>
                <el-button type="primary" @click="save">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
</template>

<script>
import {
    getThreePressureProfileListApi,
    saveThreePressureProfileApi,
    deleteThreePressureProfileApi
} from '../../../api/threePressureProfile';

export default {
    name: 'threePressureProfile',
    data() {
        return {
            wellName: '龙004-X1',
            isShowDilog: false,
            threePressureProfileList: [],
            threePressureProfile: {},
            dialogTitile: '添加三压力剖面数据'
        };
    },
    mounted() {
        this.wellName=this.$store.state.jh;
        this.getThreePressureProfileList();
    },
    methods: {
        async getThreePressureProfileList() {
            var data = { jh: this.wellName };
            const res = await getThreePressureProfileListApi(data);
            this.threePressureProfileList = res.content;
        },
        add() {
            this.threePressureProfile = {
                id: '00000000-0000-0000-0000-000000000000',
                wellName: this.wellName,
                formationName: '',
                porePressureGrad: 0,
                fracturePressureGrad: 0,
                collapsePressureGrad: 0,
                tvd: 0
            };
            this.dialogTitile = '添加三压力剖面数据';
            this.isShowDilog = true;
        },
        edit(index, item) {
            this.threePressureProfile = item;
            this.dialogTitile = '修改三压力剖面数据';
            this.isShowDilog = true;
        },
        async save() {
            this.threePressureProfile.porePressureGrad = parseFloat(this.threePressureProfile.porePressureGrad);
            this.threePressureProfile.fracturePressureGrad = parseFloat(this.threePressureProfile.fracturePressureGrad);
            this.threePressureProfile.collapsePressureGrad = parseFloat(this.threePressureProfile.collapsePressureGrad);
            this.threePressureProfile.tvd = parseFloat(this.threePressureProfile.tvd);

            const res = await saveThreePressureProfileApi(this.threePressureProfile);
            this.threePressureProfileList = res.content;
            this.isShowDilog = false;
        },
        async delete2(index, item) {
            this.threePressureProfile = item;
            const res = await deleteThreePressureProfileApi(this.threePressureProfile);
            this.threePressureProfileList = res.content;
        }
    }
};
</script scoped>

<style>
</style>
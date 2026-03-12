<template>
    <el-card>
        <el-row>
            <el-col :span="24">
                <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="add">添加</el-button>

                <el-table :data="bitList" style="margin: 10px 0 5px 0">
                    <el-table-column prop="bitNumber" label="钻头编号" />
                    <el-table-column prop="bitSize" label="钻头尺寸（mm）" />
                    <el-table-column prop="manufactor" label="厂家" />
                    <el-table-column prop="model" label="钻头型号" />
                    <el-table-column prop="iadc" label="IADC编码" />
                    <el-table-column prop="startDepth" label="起始深度（m）" />
                    <el-table-column prop="endDepth" label="结束深度（m）" />
                    <el-table-column prop="equiDia" label="当量直径" />
                    <el-table-column prop="jet1" label="喷嘴1" />
                    <el-table-column prop="jet2" label="喷嘴2" />
                    <el-table-column prop="jet3" label="喷嘴3" />
                    <el-table-column prop="jet4" label="喷嘴4" />
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
            <el-form ref="form" :model="bit" label-width="100px" label-position="right">
                <el-row>
                    <el-col :span="20">
                        <el-form-item label="钻头尺寸">
                            <el-input v-model="bit.bitSize" placeholder="钻头尺寸">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="钻头编号"> <el-input v-model="bit.bitNumber" placeholder="钻头编号"> </el-input> </el-form-item
                    ></el-col>
                    <el-col :span="12">
                        <el-form-item label="厂家"> <el-input v-model="bit.manufactor" placeholder="厂家"> </el-input> </el-form-item
                    ></el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="钻头型号">
                            <el-input v-model="bit.model" placeholder="钻头型号"> </el-input> </el-form-item
                    ></el-col>
                    <el-col :span="12">
                        <el-form-item label="IADC编码">
                            <el-input v-model="bit.iadc" placeholder="IADC编码"> </el-input> </el-form-item
                    ></el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="起始深度">
                            <el-input v-model="bit.startDepth" placeholder="起始深度">
                                <template slot="append">m</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                    <el-col :span="12">
                        <el-form-item label="结束深度">
                            <el-input v-model="bit.endDepth" placeholder="结束深度">
                                <template slot="append">m</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="喷嘴1">
                            <el-input v-model="bit.jet1" placeholder="喷嘴1">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                    <el-col :span="12">
                        <el-form-item label="喷嘴2">
                            <el-input v-model="bit.jet2" placeholder="喷嘴2">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="喷嘴3">
                            <el-input v-model="bit.jet3" placeholder="喷嘴3">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                    <el-col :span="12">
                        <el-form-item label="喷嘴4">
                            <el-input v-model="bit.jet4" placeholder="喷嘴4">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="喷嘴5">
                            <el-input v-model="bit.jet5" placeholder="喷嘴5">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                    <el-col :span="12">
                        <el-form-item label="喷嘴6">
                            <el-input v-model="bit.jet6" placeholder="喷嘴6">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="喷嘴7">
                            <el-input v-model="bit.jet7" placeholder="喷嘴7">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                    <el-col :span="12">
                        <el-form-item label="喷嘴8">
                            <el-input v-model="bit.jet8" placeholder="喷嘴8">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item></el-col
                    >
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isShowDilog = false">取 消</el-button>
                <el-button type="primary" @click="save">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
</template>

<script>
import { getBitListApi, saveBitApi, deleteBitApi } from '../../../api/bit';

export default {
    name: 'bit',
    data() {
        return {
            wellName: '龙004-X1',
            isShowDilog: false,
            bitList: [],
            bit: {},
            dialogTitile: '添加钻头测量数据'
        };
    },
    mounted() {
        this.wellName=this.$store.state.jh;
        this.getBitList();
    },
    methods: {
        async getBitList() {
            var data = { jh: this.wellName };
            const res = await getBitListApi(data);
            this.bitList = res.content;
        },
        add() {
            this.bit = {
                id: '00000000-0000-0000-0000-000000000000',
                wellName: this.wellName,
                bitSize:0,
                startDepth:0,
                endDepth:0,
                jet1:0,
                jet2:0,
                jet3:0,
                jet4:0,
                jet5:0,
                jet6:0,
                jet7:0,
                jet8:0,
                equiDia:0
            };
            this.dialogTitile = '添加钻头测量数据';
            this.isShowDilog = true;
        },
        edit(index, item) {
            this.bit = item;
            this.dialogTitile = '修改钻头液测量数据';
            this.isShowDilog = true;
        },
        async save() {
            this.bit.bitSize = parseFloat(this.bit.bitSize);
            this.bit.startDepth = parseFloat(this.bit.startDepth);
            this.bit.endDepth = parseFloat(this.bit.endDepth);
            this.bit.jet1 = parseFloat(this.bit.jet1);
            this.bit.jet2 = parseFloat(this.bit.jet2);
            this.bit.jet3 = parseFloat(this.bit.jet3);
            this.bit.jet4 = parseFloat(this.bit.jet4);
            this.bit.jet5 = parseFloat(this.bit.jet5);
            this.bit.jet6 = parseFloat(this.bit.jet6);
            this.bit.jet7 = parseFloat(this.bit.jet7);
            this.bit.jet8 = parseFloat(this.bit.jet8);

            const res = await saveBitApi(this.bit);
            this.bitList = res.content;
            this.isShowDilog = false;
        },
        async delete2(index, item) {
            this.bit = item;
            const res = await deleteBitApi(this.bit);
            this.bitList = res.content;
        }
    }
};
</script>

<style scoped>
</style>
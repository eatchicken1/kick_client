<template>
    <el-card>
        <el-row>
            <el-col :span="24">
                <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="add">添加</el-button>

                <el-table :data="mudList" style="margin: 10px 0 5px 0">
                    <el-table-column prop="createTime" label="日期" :formatter="dateFormat"> </el-table-column>
                    <el-table-column prop="wellDepth" label="深度(m)" />
                    <el-table-column prop="density" label="密度(g/cm³)" />
                    <el-table-column prop="viS3" label="3转读数" />
                    <el-table-column prop="viS6" label="6转读数" />
                    <el-table-column prop="viS100" label="100转读数" />
                    <el-table-column prop="viS200" label="200转读数" />
                    <el-table-column prop="viS300" label="300转读数" />
                    <el-table-column prop="viS600" label="600转读数" />
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

        <el-dialog :title="dialogTitile" :visible.sync="isShowDilog" width="30%">
            <el-form ref="form" :model="mud" label-width="100px" label-position="right">
                <el-form-item label="日期">
                    <el-date-picker v-model="mud.createTime" type="datetime" placeholder="选择日期时间"> </el-date-picker>
                </el-form-item>
                <el-form-item label="深度">
                    <el-input v-model="mud.wellDepth" placeholder="深度">
                        <template slot="append">m</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="密度">
                    <el-input v-model="mud.density" placeholder="密度">
                        <template slot="append">g/cm³</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="3转读数">
                    <el-input v-model="mud.viS3" placeholder="3转读数"> </el-input>
                </el-form-item>
                <el-form-item label="6转读数">
                    <el-input v-model="mud.viS6" placeholder="6转读数"> </el-input>
                </el-form-item>
                <el-form-item label="100转读数">
                    <el-input v-model="mud.viS100" placeholder="100转读数"> </el-input>
                </el-form-item>
                <el-form-item label="200转读数">
                    <el-input v-model="mud.viS200" placeholder="200转读数"> </el-input>
                </el-form-item>
                <el-form-item label="300转读数">
                    <el-input v-model="mud.viS300" placeholder="300转读数"> </el-input>
                </el-form-item>
                <el-form-item label="600转读数">
                    <el-input v-model="mud.viS600" placeholder="600转读数"> </el-input>
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
import { getMudListApi, saveMudApi, deleteMudApi } from '../../../api/mud';
import moment from 'moment';

export default {
    name: 'mud',
    data() {
        return {
            wellName: '龙004-X1',
            isShowDilog: false,
            mudList: [],
            mud: {},
            dialogTitile: '添加钻井液测量数据'
        };
    },
    mounted() {
        this.wellName=this.$store.state.jh;
        this.getMudList();
    },
    methods: {
        async getMudList() {
            var data = { jh: this.wellName };
            const res = await getMudListApi(data);
            this.mudList = res.content;
        },
        add() {
            var nowDate = new Date();
            this.mud = {
                id: '00000000-0000-0000-0000-000000000000',
                wellName: this.wellName,
                wellDepth: 0,
                density: 0,
                viS3: 0,
                viS6: 0,
                viS100: 0,
                viS200: 0,
                viS300: 0,
                viS600: 0,
                createTime: nowDate.toLocaleDateString()
            };

            this.dialogTitile = '添加钻井液测量数据';
            this.isShowDilog = true;
        },
        edit(index, item) {
            this.mud = item;
            this.dialogTitile = '修改钻井液测量数据';
            this.isShowDilog = true;
        },
        async save() {
            this.mud.wellDepth = parseFloat(this.mud.wellDepth);
            this.mud.density = parseFloat(this.mud.density);
            this.mud.viS3 = parseFloat(this.mud.viS3);
            this.mud.viS6 = parseFloat(this.mud.viS6);
            this.mud.viS100 = parseFloat(this.mud.viS100);
            this.mud.viS200 = parseFloat(this.mud.viS200);
            this.mud.viS300 = parseFloat(this.mud.viS300);
            this.mud.viS600 = parseFloat(this.mud.viS600);

            const res = await saveMudApi(this.mud);
            this.mudList = res.content;
            this.isShowDilog = false;
        },
        async delete2(index, item) {
            this.mud = item;
            const res = await deleteMudApi(this.mud);
            this.mudList = res.content;
        },
        dateFormat: function (row, column) {
            var date = row[column.property];
            if (date == undefined) {
                return '';
            }
            return moment(date).format('YYYY-MM-DD HH:mm');
        }
    }
};
</script>

<style scoped>
</style>
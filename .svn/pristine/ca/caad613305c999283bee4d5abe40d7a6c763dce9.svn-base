<template>
  <el-card>
    <el-row type="flex">
      <el-col :span="24">
        <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="addWellStructure">添加</el-button>
        <el-table :data="wellStructureList" highlight-current-row @current-change="handleCurrentChange" style="margin: 10px 0 5px 0; min-height: 300px" max-height="320">
          <el-table-column prop="drillingSequence" label="开次" />
          <el-table-column prop="casingName" label="套管名称" />
          <el-table-column prop="bitSize" label="井眼尺寸(mm)" />
          <el-table-column prop="wellDepth" label="井深（m）" />
          <el-table-column prop="casingTopDepth" label="套管顶深（m）" />
          <el-table-column prop="casingSettingDepth" label="套管底深（m）" />
          <el-table-column prop="cementSheathTopDepth" label="水泥环顶深（m）" />
          <el-table-column prop="cementSheathBottomDepth" label="水泥环底深（m）" />
          <el-table-column prop="remark" label="说明" />

          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" icon="el-icon-edit" @click="editWellStructure(scope.$index, scope.row)">编辑</el-button>
              <el-button style="margin: 0 0 0 15px" size="mini" type="danger" icon="el-icon-delete" @click="deleteWellStructure(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-row type="flex" style="margin-top: 0">
      <el-col :span="24">
        <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="addCasing">添加</el-button>

        <el-table :data="casingList" style="margin: 10px 0 5px 0" max-height="650">
          <el-table-column prop="casingName" label="套管名称" />
          <el-table-column prop="topDepth" label="顶深（m）" />
          <el-table-column prop="endDepth" label="底深（m）" />
          <el-table-column prop="outerDia" label="外径（mm）" />
          <el-table-column prop="wallThickness" label="壁厚（mm）" />
          <el-table-column prop="steelGrade" label="钢级" />
          <el-table-column prop="unitWeight" label="线重（N/m）" />
          <el-table-column prop="threadType" label="扣型" />
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" icon="el-icon-edit" @click="editCasing(scope.$index, scope.row)">编辑</el-button>
              <el-button style="margin: 0 0 0 15px" size="mini" type="danger" icon="el-icon-delete" @click="deleteCasing(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-dialog :title="wellStructureDialogTitile" :visible.sync="addWellStructureDlg" width="30%">
      <el-form ref="form" :model="structure" label-width="120px" label-position="right">
        <el-form-item label="开次">
          <el-input v-model="structure.drillingSequence" placeholder="开次"> </el-input>
        </el-form-item>
        <el-form-item label="套管名称">
          <el-input v-model="structure.casingName" placeholder="套管名称"> </el-input>
        </el-form-item>
        <el-form-item label="井眼尺寸">
          <el-input v-model="structure.bitSize" placeholder="井眼尺寸">
            <template slot="append">mm</template>
          </el-input>
        </el-form-item>
        <el-form-item label="井深">
          <el-input v-model="structure.wellDepth" placeholder="井深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="套管顶深">
          <el-input v-model="structure.casingTopDepth" placeholder="套管顶深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="套管底深">
          <el-input v-model="structure.casingSettingDepth" placeholder="套管底深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="水泥环顶深">
          <el-input v-model="structure.cementSheathTopDepth" placeholder="水泥环顶深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="水泥环底深">
          <el-input v-model="structure.cementSheathBottomDepth" placeholder="水泥环底深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="structure.remark" type="textarea" :rows="2" placeholder="说明"> </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddWellStructure">取 消</el-button>
        <el-button type="primary" @click="saveWellStructure">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="casingDialogTitile" :visible.sync="addCasingDlg" width="25%">
      <el-form ref="form" :model="casing" label-width="90px" label-position="right">
        <el-form-item label="套管名称">
          <el-input v-model="casing.casingName" placeholder="套管名称"> </el-input>
        </el-form-item>
        <el-form-item label="顶深">
          <el-input v-model="casing.topDepth" placeholder="顶深"> </el-input>
          <template slot="append">m</template>
        </el-form-item>
        <el-form-item label="底深">
          <el-input v-model="casing.endDepth" placeholder="底深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="外径">
          <el-input v-model="casing.outerDia" placeholder="外径">
            <template slot="append">mm</template>
          </el-input>
        </el-form-item>
        <el-form-item label="壁厚">
          <el-input v-model="casing.wallThickness" placeholder="壁厚">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="钢级">
          <el-input v-model="casing.steelGrade" placeholder="钢级"> </el-input>
        </el-form-item>
        <el-form-item label="线重">
          <el-input v-model="casing.unitWeight" placeholder="线重">
            <template slot="append">N/m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="扣型">
          <el-input v-model="casing.threadType" placeholder="扣型"> </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCasingDlg = false">取 消</el-button>
        <el-button type="primary" @click="saveCasing">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import {
  getWellStructureListApi,
  getCasingListApi,
  saveWellStructureApi,
  deleteWellStructureApi,
  saveCasingApi,
  deleteCasingApi
} from '../../../api/wellStructure';

export default {
  name: 'wellStructure',
  data() {
    return {
      wellName: '龙004-X1',
      structure: {},
      wellStructureList: [],
      casing: {},
      casingList: [],
      wellStructureDialogTitile: '添加井身结构数据',
      addWellStructureDlg: false,
      casingDialogTitile: '添加套管数据',
      addCasingDlg: false
    };
  },
  mounted() {
    this.wellName = this.$store.state.jh;
    console.log(this.jh)
    this.getWellStructureList();
  },
  methods: {
    async getWellStructureList() {
      var data = { jh: this.wellName };
      const res = await getWellStructureListApi(data);
      this.wellStructureList = res.content;
    },
    handleCurrentChange(val) {
      this.structure = val;
      this.getCasingList();
    },
    async getCasingList() {
      var data = { wellStructureId: this.structure.id };
      const res = await getCasingListApi(data);
      this.casingList = res.content;
    },
    addWellStructure() {
      this.wellStructureDialogTitile = '添加井身结构数据';
      this.structure = {
        id: '00000000-0000-0000-0000-000000000000',
        wellName: this.wellName,
        drillingSequence: 0,
        bitSize: 0,
        wellDepth: 0,
        casingTopDepth: 0,
        casingSettingDepth: 0,
        cementSheathTopDepth: 0,
        cementSheathBottomDepth: 0,
        casingName: '',
        remark: ''
      };
      this.addWellStructureDlg = true;
    },
    cancelAddWellStructure() {
      if (this.structure.id == '00000000-0000-0000-0000-000000000000') {
        this.structure = {};
      }
      this.addWellStructureDlg = false;
    },
    async saveWellStructure() {
      this.structure.drillingSequence = parseInt(this.structure.drillingSequence);
      this.structure.bitSize = parseFloat(this.structure.bitSize);
      this.structure.wellDepth = parseFloat(this.structure.wellDepth);
      this.structure.casingTopDepth = parseFloat(this.structure.casingTopDepth);
      this.structure.casingSettingDepth = parseFloat(this.structure.casingSettingDepth);
      this.structure.cementSheathTopDepth = parseFloat(this.structure.cementSheathTopDepth);
      this.structure.cementSheathBottomDepth = parseFloat(this.structure.cementSheathBottomDepth);

      console.log(this.structure);
      const res = await saveWellStructureApi(this.structure);
      this.wellStructureList = res.content;
      this.casingList = [];
      this.addWellStructureDlg = false;
    },
    editWellStructure(index, item) {
      this.wellStructureDialogTitile = '修改井身结构数据';
      this.structure = item;
      this.addWellStructureDlg = true;
    },
    async deleteWellStructure(index, item) {
      const res = await deleteWellStructureApi(item);
      this.wellStructureList = res.content;
      this.casingList = [];
    },
    async saveCasing() {
      this.casing.topDepth = parseFloat(this.casing.topDepth);
      this.casing.endDepth = parseFloat(this.casing.endDepth);
      this.casing.outerDia = parseFloat(this.casing.outerDia);
      this.casing.wallThickness = parseFloat(this.casing.wallThickness);
      this.casing.unitWeight = parseFloat(this.casing.unitWeight);

      const res = await saveCasingApi(this.casing);
      this.casingList = res.content;
      this.addCasingDlg = false;
    },
    addCasing() {
      if (this.structure.id) {
        this.casingDialogTitile = '添加套管数据';
        this.casing = {
          id: '00000000-0000-0000-0000-000000000000',
          wellStructureId: this.structure.id,
          topDepth: 0,
          endDepth: 0,
          outerDia: 0,
          wallThickness: 0,
          unitWeight: 0
        };

        this.addCasingDlg = true;
      }
    },
    editCasing(index, item) {
      this.casingDialogTitile = '修改套管数据';
      this.casing = item;
      this.addCasingDlg = true;
    },
    async deleteCasing(index, item) {
      const res = await deleteCasingApi(item);
      this.casingList = res.content;
    }
  }
};
</script>

<style scoped>
</style>
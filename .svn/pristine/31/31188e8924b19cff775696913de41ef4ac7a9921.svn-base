<template>
  <el-card>
    <el-container>
      <el-aside style="width: 480px">
        <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="handleAdd">添加</el-button>

        <el-table :data="surveyList" style="margin: 10px 0 5px 0" max-height="650">
          <el-table-column prop="md" label="测深（m）" />
          <el-table-column prop="inc" label="井斜（°）" />
          <el-table-column prop="azi" label="方位（°）" />
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button style="margin: 0 0 0 15px" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-aside>
      <el-container>
        <el-header>
          <el-form style="margin-top:2px">
            <el-form-item label="离散参数设置">
              <el-input v-model="param.projectionAzimuth" class="input">
                <template slot="prepend">投影方位</template>
                <template slot="append">°</template>
              </el-input>
              <el-input v-model="param.discreteSpace" class="input">
                <template slot="prepend">离散间距</template>
                <template slot="append">m</template>
              </el-input>
              <el-button type="primary" class="button" @click="calc" style="margin-left:10px">计算</el-button>
            </el-form-item>
          </el-form>
        </el-header>
        <el-main style="margin-top:-45px">
          <el-table :data="discreteList" style="margin: 10px 5px 5px 5px" max-height="652">
            <el-table-column prop="md" label="测深（m）" />
            <el-table-column prop="inc" label="井斜（°）" />
            <el-table-column prop="azimuth" label="方位（°）" />
            <el-table-column prop="tvd" label="垂深（m）" />
            <el-table-column prop="northCoordinate" label="北坐标（m）" />
            <el-table-column prop="eastCoordinate" label="东坐标（m）" />
            <el-table-column prop="dogleg" label="狗腿角（°/30m）" />
            <el-table-column prop="closureDistance" label="闭合距（m）" />
            <el-table-column prop="closureAzimuth" label="闭合方位（°）" />
          </el-table>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog :title="surveyDialogTitile" :visible.sync="addDlg" width="30%">
      <el-form ref="form" :model="suveryModel" label-width="80px" label-position="right">
        <el-form-item label="测深">
          <el-input v-model="suveryModel.md" placeholder="测深">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="井斜">
          <el-input v-model="suveryModel.inc" placeholder="井斜">
            <template slot="append">°</template>
          </el-input>
        </el-form-item>
        <el-form-item label="方位角">
          <el-input v-model="suveryModel.azi" placeholder="方位角">
            <template slot="append">°</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDlg = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { getTrajectorydataApi } from '../../../api/trajectory';
import { saveTrajectoryApi } from '../../../api/trajectory';
import { deleteTrajectoryApi } from '../../../api/trajectory';
import { discreteTrajectoryApi } from '../../../api/trajectory';

export default {
  name: 'survey',
  data() {
    var wellName = '龙004-X1';
    return {
      jh: wellName,
      param: {
        id: '00000000-0000-0000-0000-000000000000',
        wellName: wellName,
        azimuthType: 0,
        magneticDeclination: 0,
        meridianConvergence: 0,
        projectionAzimuth: 0,
        discreteSpace: 10
      },
      surveyList: [],
      discreteList: [],
      addDlg: false,
      suveryModel: {},
      surveyDialogTitile: '新增设计井眼轨道数据'
    };
  },
  created() {
    this.jh = this.$store.state.jh;
    this.getInitdata();
  },
  methods: {
    async getInitdata() {
      var data = { jh: this.jh };
      const res = await getTrajectorydataApi(data);
      console.log('result:', res);
      this.init(res);
    },
    handleAdd() {
      this.surveyDialogTitile = '新增设计井眼轨道数据';
      this.suveryModel = {
        id: '00000000-0000-0000-0000-000000000000',
        wellName: this.jh,
        md: 0,
        inc: 0,
        azi: 0
      };
      this.addDlg = true;
    },
    handleEdit(index, item) {
      this.surveyDialogTitile = '修改设计井眼轨道数据';
      this.suveryModel = item;
      this.addDlg = true;
    },
    async handleDelete(index, item) {
      const res = await deleteTrajectoryApi(item);
      if (res.isSuccess) {
        this.surveyList = res.content;
        this.$message.success('删除成功');
      }
    },
    init(res) {
      this.param = res.content[0];
      this.surveyList = res.content[1];
      this.discreteList = res.content[2];
    },
    async save() {
      this.suveryModel.md = parseFloat(this.suveryModel.md);
      this.suveryModel.inc = parseFloat(this.suveryModel.inc);
      this.suveryModel.azi = parseFloat(this.suveryModel.azi);

      const res = await saveTrajectoryApi(this.suveryModel);
      this.surveyList = res.content;
      this.addDlg = false;
    },
    async calc() {
      console.log(this.param);
      this.param.magneticDeclination = parseFloat(this.param.magneticDeclination);
      this.param.meridianConvergence = parseFloat(this.param.meridianConvergence);
      this.param.projectionAzimuth = parseFloat(this.param.projectionAzimuth);
      this.param.discreteSpace = parseFloat(this.param.discreteSpace);
      
      const res = await discreteTrajectoryApi(this.param);
      this.discreteList = res.content;
    }
  }
};
</script>

<style scoped>
.input {
    width: 300px;
    margin-left: 10px;
}
</style>
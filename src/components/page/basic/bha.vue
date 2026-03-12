<template>
  <el-card>
    <el-row>
      <el-col :span="24">
        <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="addBha">添加</el-button>
                <el-table :data="bhaList" highlight-current-row @row-click="handleBhaChange" style="margin: 10px 0 5px 0">
                    <el-table-column prop="drillStringNumber" label="编号" />
                    <el-table-column prop="startDepth" label="开始深度（m）" />
                    <el-table-column prop="endDepth" label="结束深度（m）" />
                    <el-table-column prop="buildUpRate" label="造斜率（°/30m）" />
                    <el-table-column prop="drillingMode" label="钻进模式" />
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button size="mini" icon="el-icon-edit" @click="editBha(scope.$index, scope.row)">编辑</el-button>
                            <el-button style="margin: 0 0 0 15px" size="mini" type="danger" icon="el-icon-delete" @click="deleteBha(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
            <el-col :span="24">
                <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="addTool">添加</el-button>
                <el-table :data="toolList" highlight-current-row @row-click="handleToolChange" style="margin: 10px 0 5px 0">
                    <el-table-column prop="orderNumber" label="序号" />
                    <el-table-column prop="toolName" label="钻具名称" />
                    <el-table-column prop="outerDia" label="外径（mm）" />
                    <el-table-column prop="innerDia" label="内径（mm）" />
                    <el-table-column prop="length" label="长度（m）" />
                    <el-table-column prop="cumulativeLength" label="累积长度（m）" />
                    <el-table-column prop="steelGrade" label="钢级" />
                    <el-table-column prop="unitWeight" label="线重（N/m）" />
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button size="mini" icon="el-icon-edit" @click="editTool(scope.$index, scope.row)">编辑</el-button>
                            <el-button style="margin: 0 0 0 15px" size="mini" type="danger" icon="el-icon-delete" @click="deleteTool(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-button icon="el-icon-plus" style="margin: 2px 0 0 20px" @click="addMotor">添加螺杆技术参数</el-button>
                <el-table :data="MotorList" style="margin: 10px 0 5px 0">
                    <el-table-column prop="manufacturer" label="厂家" />
                    <el-table-column prop="model" label="型号" />
                    <el-table-column prop="perFlow" label="每转排量(L/r)" />
                    <el-table-column prop="wob" label="推荐钻压(kN)" />
                    <el-table-column prop="wobMax" label="最大钻压(kN)" />
                    <el-table-column prop="flowRate" label="推荐排量(L/s)" />
                    <el-table-column prop="flowRateMax" label="最大排量((L/s)" />
                    <el-table-column prop="pressureDorp" label="工作压降(MPa)" />
                    <el-table-column prop="pressureDorpMax" label="最大压降(MPa)" />
                    <el-table-column prop="rpm" label="推荐转速(rpm)" />
                    <el-table-column prop="rpmMax" label="最大转速(rpm)" />
                    <el-table-column prop="torque" label="工作扭矩(N·m)" />
                    <el-table-column prop="torqueMax" label="最大扭矩(N·m)" />
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button size="mini" icon="el-icon-edit" @click="editMotor(scope.$index, scope.row)">编辑</el-button>
                            <el-button style="margin: 0 0 0 15px" size="mini" type="danger" icon="el-icon-delete" @click="deleteMotor(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitile" :visible.sync="isAddMotor" width="30%">
            <el-form ref="form" :model="Motor" label-width="120px" label-position="right">
                <el-form-item label="厂家">
                    <el-input v-model="Motor.manufacturer" placeholder="厂家"></el-input>
                </el-form-item>
                <el-form-item label="型号">
                    <el-input v-model="Motor.model" placeholder="型号"> </el-input>
                </el-form-item>
                <el-form-item label="每转排量">
                    <el-input v-model="Motor.perFlow" placeholder="每转排量">
                        <template slot="append">L/s</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="推荐钻压">
                    <el-input v-model="Motor.wob" placeholder="推荐钻压">
                        <template slot="append">kN</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="最大钻压">
                    <el-input v-model="Motor.wobMax" placeholder="最大钻压">
                        <template slot="append">kN</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="推荐排量">
                    <el-input v-model="Motor.flowRate" placeholder="推荐排量">
                        <template slot="append">L/s</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="最大排量">
                    <el-input v-model="Motor.flowRateMax" placeholder="最大排量">
                        <template slot="append">L/s</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="工作压降">
                    <el-input v-model="Motor.pressureDorp" placeholder="工作压降">
                        <template slot="append">MPa</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="最大压降">
                    <el-input v-model="Motor.pressureDorpMax" placeholder="最大压降">
                        <template slot="append">MPa</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="推荐转速">
                    <el-input v-model="Motor.rpm" placeholder="推荐转速"></el-input>
                </el-form-item>
                <el-form-item label="最大转速">
                    <el-input v-model="Motor.rpmMax" placeholder="最大转速"></el-input>
                </el-form-item>
                <el-form-item label="工作扭矩">
                    <el-input v-model="Motor.torque" placeholder="工作扭矩">
                        <template slot="append">N·m</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="最大扭矩">
                    <el-input v-model="Motor.torqueMax" placeholder="最大扭矩">
                        <template slot="append">N·m</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isAddMotor = false">取 消</el-button>
                <el-button type="primary" @click="saveMotor">确 定</el-button>
            </span>
        </el-dialog>
    <el-dialog :title="bhaDialogTitile" :visible.sync="isEditBhaDilog" width="30%">
      <el-form ref="form" :model="bha" label-width="120px" label-position="right">
        <el-form-item label="编号">
          <el-input v-model="bha.drillStringNumber" placeholder="编号"> </el-input>
        </el-form-item>
        <el-form-item label="开始深度">
          <el-input v-model="bha.startDepth" placeholder="开始深度">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="结束深度">
          <el-input v-model="bha.endDepth" placeholder="结束深度">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="造斜率">
          <el-input v-model="bha.buildUpRate" placeholder="造斜率">
            <template slot="append">°/30m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="钻进模式">
          <el-input v-model="bha.drillingMode" placeholder="钻进模式"> </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddBha">取 消</el-button>
        <el-button type="primary" @click="saveBha">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="toolDialogTitile" :visible.sync="isEditToolDilog" width="30%">
      <el-form ref="form" :model="tool" label-width="120px" label-position="right">
        <el-form-item label="序号">
          <el-input v-model="tool.orderNumber" placeholder="序号"> </el-input>
        </el-form-item>
        <el-form-item label="钻具名称">
          <el-input v-model="tool.toolName" placeholder="钻具名称"> </el-input>
        </el-form-item>
        <el-form-item label="外径">
          <el-input v-model="tool.outerDia" placeholder="外径">
            <template slot="append">mm</template>
          </el-input>
        </el-form-item>
        <el-form-item label="内径">
          <el-input v-model="tool.innerDia" placeholder="内径">
            <template slot="append">mm</template>
          </el-input>
        </el-form-item>
        <el-form-item label="钢级">
          <el-input v-model="tool.steelGrade" placeholder="钢级"> </el-input>
        </el-form-item>
        <el-form-item label="线重">
          <el-input v-model="tool.unitWeight" placeholder="线重">
            <template slot="append">N/m</template>
          </el-input>
        </el-form-item>
        <el-form-item label="长度">
          <el-input v-model="tool.length" placeholder="长度">
            <template slot="append">m</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isEditToolDilog = false">取 消</el-button>
        <el-button type="primary" @click="saveTool">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { getBhaListApi, getComponentListApi, saveBhaApi, saveComponentApi, deleteBhaApi, deleteComponentApi } from '../../../api/bha';
import { fetchApidata } from '../../../api/index';
export default {
    name: 'bha',
    data() {
        return {
            wellName: '龙004-X1',
            bha: {},
            bhaList: [],
            tool: {},
            toolList: [],
            isEditBhaDilog: false,
            bhaDialogTitile: '添加钻具组合数据',
            isEditToolDilog: false,
            toolDialogTitile: '添加钻具数据',
            isAddMotor: false,
            MotorList: [],
            Motor: {},
            dialogTitile: '添加螺杆技术参数'
        };
    },
    mounted() {
        this.wellName = this.$store.state.jh;
        this.getBhaList();
    },
    methods: {
        async getBhaList() {
            var data = { jh: this.wellName };
            const res = await getBhaListApi(data);
            this.bhaList = res.content;
            this.toolList = [];
        },
        handleBhaChange(row) {
            this.bha = row;
            this.MotorList=[]
            this.getComponentList();
        },
        addBha() {
            this.bha = {
                id: '00000000-0000-0000-0000-000000000000',
                wellName: this.wellName,
                buildUpRate: 0,
                drillStringNumber: 0,
                startDepth: 0,
                endDepth: 0
            };
            this.bhaDialogTitile = '添加钻具组合数据';
            this.isEditBhaDilog = true;
        },
        cancelAddBha() {
            if (this.bha.id == '00000000-0000-0000-0000-000000000000') {
                this.bha = {};
            }
            this.isEditBhaDilog = false;
        },
        editBha(index,item) {
            this.bha = item;
            this.bhaDialogTitile = '修改钻具组合数据';
            this.isEditBhaDilog = true;
        },
        async deleteBha(index, item) {
            this.bha = item;
            const res = await deleteBhaApi(this.bha);
            this.bhaList = res.content;
            this.toolList = [];
        },
        async getComponentList() {
            if (this.bha.id) {
                var data = { bhaId: this.bha.id };
                const res = await getComponentListApi(data);
                this.toolList = res.content;
            }
        },
        async saveBha() {
            this.bha.drillStringNumber = parseInt(this.bha.drillStringNumber);
            this.bha.startDepth = parseFloat(this.bha.startDepth);
            this.bha.endDepth = parseFloat(this.bha.endDepth);
            this.bha.buildUpRate = parseFloat(this.bha.buildUpRate);

      const res = await saveBhaApi(this.bha);
      this.bhaList = res.content;
      this.toolList = [];

      this.isEditBhaDilog = false;
    },
    addTool() {
      if (this.bha.id) {
        this.tool = {
          id: '00000000-0000-0000-0000-000000000000',
          BhaId: this.bha.id,
          orderNumber: 0,
          outerDia: 0,
          innerDia: 0,
          unitWeight: 0,
          length: 0
        };
        this.toolDialogTitile = '添加钻具数据';
        this.isEditToolDilog = true;
      }
    },
    editTool(index, item) {
      this.tool = item;
      this.toolDialogTitile = '修改钻具数据';
      this.isEditToolDilog = true;
    },
    async deleteTool(index, item) {
      this.tool = item;
      const res = await deleteComponentApi(this.tool);
      this.toolList = res.content;
    },
    async saveTool() {
      this.tool.orderNumber = parseInt(this.tool.orderNumber);
      this.tool.outerDia = parseFloat(this.tool.outerDia);
      this.tool.innerDia = parseFloat(this.tool.innerDia);
      this.tool.unitWeight = parseFloat(this.tool.unitWeight);
      this.tool.length = parseFloat(this.tool.length);
            const res = await saveComponentApi(this.tool);
            this.toolList = res.content;
        },
        handleToolChange(row) {
            this.tool = row;
            if (this.tool.toolName.indexOf("螺杆") > -1) {
                this.getMotor();
            } else {
                this.MotorList = [];
            }
        },
        async getMotor() {
            if (this.tool.id) {
                var data = { compId: this.tool.id };
                const res = await fetchApidata('Bha/GetMotor', data, 'get');
                this.MotorList = res.content;
            }
        },
        addMotor() {
            if (this.tool.toolName.indexOf("螺杆") > -1) {
                this.isAddMotor = true;
                this.Motor = {
                    id: '00000000-0000-0000-0000-000000000000',
                    bhaComponentId: this.tool.id,
                };
            } else {
                this.$message.warning('请选择螺杆钻具');
            }
        },
        editMotor(index, item) {
            this.Motor = item;
            this.dialogTitile = '修改螺杆技术参数';
            this.isAddMotor = true;
        },
        async saveMotor() {
            this.Motor.pressureDorp = parseFloat(this.Motor.pressureDorp);
            this.Motor.pressureDorpMax = parseFloat(this.Motor.pressureDorpMax);
            this.Motor.flowRate = parseFloat(this.Motor.flowRate);
            this.Motor.flowRateMax = parseFloat(this.Motor.flowRateMax);
            this.Motor.wob = parseFloat(this.Motor.wob);
            this.Motor.wobMax = parseFloat(this.Motor.wobMax);
            this.Motor.rpm = parseFloat(this.Motor.rpm);
            this.Motor.rpmMax = parseFloat(this.Motor.rpmMax);
            this.Motor.torque = parseFloat(this.Motor.torque);
            this.Motor.torqueMax = parseFloat(this.Motor.torqueMax);
            this.Motor.perFlow = parseFloat(this.Motor.perFlow);
            const res = await fetchApidata('Bha/InsertOrUpdateMotor', this.Motor, 'post');
            this.MotorList = res.content;
            this.isAddMotor = false;
        },
        async deleteMotor(index, item) {
            this.Motor = item;
            const res = await fetchApidata('Bha/DeleteMotor', this.Motor, 'post');
            this.MotorList = res.content;
        }

    }
  }
</script>

<style scoped>
</style>
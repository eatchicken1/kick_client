<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <div class="logo">事故复杂预警子系统<span style="font-size:15px">—{{jh}}</span></div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全局计算参数设置 -->
                <div @click="handleParaChange">
                    <el-tooltip effect="dark" content="计算参数设置" placement="bottom">
                        <i class="el-icon-notebook-2"></i>
                    </el-tooltip>
                </div>
                <el-dialog title="计算参数设置" :visible.sync="isEditParaDilog" width="30%">
                    <el-form ref="form" :model="para" label-width="120px" label-position="right">
                        <el-form-item label="开始计算时间">
                            <el-date-picker v-model="para.dateTime" type="datetime" style="width:100%" align="right"></el-date-picker>
                        </el-form-item>
                        <el-form-item label="请选择钻进方式">
                            <el-select @change="selectChange" v-model="para.MoveCondition" style="width:100%">
                                <el-option label="旋转钻进" value="旋转钻进"></el-option>
                                <el-option label="复合钻进" value="复合钻进"></el-option>
                                <el-option label="滑动钻进" value="滑动钻进"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="套管段摩擦系数">
                            <el-input v-model="para.CasingFc" placeholder="套管段摩擦系数" style="width:100%"></el-input>
                        </el-form-item>
                        <el-form-item label="裸眼段摩擦系数">
                            <el-input v-model="para.HoleFc" placeholder="裸眼段摩擦系数" style="width:100%"></el-input>
                        </el-form-item>
                        <el-form-item label="游动系统重量">
                            <el-input v-model="para.swimG" placeholder="游动系统重量" style="width:100%"><template slot="append">kN</template></el-input>
                        </el-form-item>
                        <el-form-item label="井底扭矩">
                            <el-input v-model="para.tor" placeholder="井底扭矩" style="width:100%"><template slot="append">MPa</template></el-input>
                        </el-form-item>
                        <el-form-item label="特殊工具压耗">
                            <el-input v-model="para.Loss" placeholder="特殊工具压耗" style="width:100%"><template slot="append">MPa</template></el-input>
                        </el-form-item>
                        <el-form-item label="钻井液粘滞力">
                            <el-radio-group v-model="radio" @change="radioChange">
                                <el-radio v-model="radio" label="1">考虑</el-radio>
                                <el-radio v-model="radio" label="2">不考虑</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="isEditParaDilog = false">取 消</el-button>
                        <el-button type="primary" @click="savePara">确 定</el-button>
                    </span>
                </el-dialog>
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>
                <!-- 用户头像 -->
                <div class="user-avator">
                    <img src="../../assets/img/img.jpg" />
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="selecthole">井号选择</el-dropdown-item>
                        <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>
<script>
import bus from '../common/bus';
import { fetchApidata } from '../../api/index';
export default {
    data() {
        return {
            collapse: false,
            fullscreen: false,
            name: 'linxin',
            jh: '',
            isEditParaDilog: false,
            para: {
                dateTime: '',
                MoveCondition: '',
                CasingFc: 0,
                HoleFc: 0,
                swimG: 0,
                Loss:0,
                tor:0,
                isViscousEffect: true,
            },
            radio: '1'
        };
    },
    computed: {
        username() {
            let username = localStorage.getItem('ms_username');
            return username ? username : this.name;
        }
    },
    methods: {
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command == 'loginout') {
                localStorage.removeItem('ms_username');
                this.$router.push('/login');
            };
            if (command == 'selecthole') {
                this.$router.push('/HoleSelect');
            };
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse;
            bus.$emit('collapse', this.collapse);
        },
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },
        handleParaChange() {
            this.isEditParaDilog = true;
        },
       async savePara() {
            this.$store.state.MoveCondition = this.para.MoveCondition;
            this.$store.state.CasingFc = parseFloat(this.para.CasingFc);
            this.$store.state.HoleFc = parseFloat(this.para.HoleFc);
            this.$store.state.isViscousEffect = this.para.isViscousEffect;
            this.$store.state.swimG = parseFloat(this.para.swimG);
             this.$store.state.Loss = parseFloat(this.para.Loss);
              this.$store.state.tor = parseFloat(this.para.tor);
            this.$store.state.StartTime = this.para.dateTime;
            const res = await fetchApidata('HoleInfo/GetHoleInfo', { wellname: this.$store.state.jh }, 'get');
            this.para.id=res.content.id;
            this.para.pictureName=res.content.pictureName;
            this.para.wellName=res.content.wellName;
            const res1 = await fetchApidata('HoleInfo/SaveHoleInfo', this.para, 'post');
            this.isEditParaDilog = false;
        },
        selectChange(val) {
            this.para.MoveCondition = val;
        },
        radioChange(val) {
            if (val == '1') {
                this.para.isViscousEffect = true;
            } else {
                this.para.isViscousEffect = false;
            }
        },
        
    },
    mounted() {
        this.jh = this.$store.state.jh;
        this.para.MoveCondition = this.$store.state.MoveCondition;
        this.para.CasingFc = this.$store.state.CasingFc;
        this.para.HoleFc = this.$store.state.HoleFc;
        this.para.isViscousEffect = this.$store.state.isViscousEffect;
        this.para.swimG = this.$store.state.swimG;
         this.para.Loss = this.$store.state.Loss;
         this.para.tor = this.$store.state.tor;
        this.para.dateTime = this.$store.state.StartTime;
        
        if (document.body.clientWidth < 1500) {
            this.collapseChage();
        }
    }
};
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;
    color: #fff;
}
.collapse-btn {
    float: left;
    padding: 0 21px;
    cursor: pointer;
    line-height: 70px;
}
.header .logo {
    float: left;
    width: 520px;
    line-height: 70px;
}
.header-right {
    float: right;
    padding-right: 50px;
}
.header-user-con {
    display: flex;
    height: 70px;
    align-items: center;
}
.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
}
.btn-bell-badge {
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}
.btn-bell .el-icon-bell {
    color: #fff;
}
.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 20px;
}
.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: #fff;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
</style>

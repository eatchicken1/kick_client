<template>
    <el-card class="box-card-container">
        <el-row>
            <el-col :span="12">
                <el-card class="box-card-3d">
                    <div slot="header" class="clearfix">
                        <span>3D井眼轨迹图</span>
                    </div>
                    <trajectory-3d :height="height3D" :width="width3D"></trajectory-3d>
                </el-card>
            </el-col>
            <el-col :span="12">
                <div class="projection-area">
                    <div>
                        <el-card class="box-card-in box-card-horizontal" :body-style="{paddingTop: '0px'}">
                            <div slot="header" class="clearfix">
                                <span>井眼轨迹水平投影</span>
                            </div>
                            <horizontal-projection></horizontal-projection>
                        </el-card>
                    </div>
                    <div>
                        <el-card class="box-card-in box-card-vertical" :body-style="{paddingTop: '0px'}">
                            <div slot="header" class="clearfix">
                                <span>井眼轨迹垂直投影</span>
                            </div>
                            <vertical-projection></vertical-projection>
                        </el-card>
                    </div>
                </div>
            </el-col>
            <!-- <el-col :span="5">
                <el-card class="box-card-in box-card-param">
                    <div slot="header" class="clearfix">
                        <span>相关参数</span>
                    </div>
                </el-card>
            </el-col> -->
        </el-row>
    </el-card>
</template>
<script>
import TrajectoryFor3D from './TrajectoryFor3D';
import HorizontalProjection from './HorizontalProjection';
import VerticalProjection from './VerticalProjection';
export default {
    name: 'WellTrajectory',
    data(){
        return{
            height3D: 0,
            width3D: 0,
            height: 0,
            width: 0,
        }
    },
    components: {
        'trajectory-3d': TrajectoryFor3D,
        'horizontal-projection': HorizontalProjection,
        'vertical-projection': VerticalProjection
    },
    methods: {
        // 监听container 的宽高变化，设置各个容器的高度
        listenContainer() {
            let that = this;
            let resizeTimer = null;
            this.$erd.listenTo(document.querySelector('.box-card-container'), function (element) {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(function () {
                    let width = element.offsetWidth;
                    let height = element.offsetHeight;
                    console.log('Size: ' + width + 'x' + height);
                    that.setHeight(height);

                    // 设置传入组件的参数
                    that.height3D = height - 40;
                    that.width3D = parseInt((width - 130) * 12 / 24);
                    that.height = (height - 160) / 2 - 50;
                    that.width = parseInt((width) * 8 / 24);
                }, 100);
            });
        },
        // 设置各个显示区域高度
        setHeight(h){
            // 3d
            let dom = document.querySelector('.box-card-3d');
            dom.style.height = h - 40 + "px";
            // 水平投影和垂直投影
            let hor = document.querySelector('.box-card-horizontal');
            let ver = document.querySelector('.box-card-vertical');
            let height = (h - 47) / 2 + "px";
            hor.style.height = height;
            ver.style.height = height;
            // 关键参数区域
            // let param = document.querySelector('.box-card-param');
            // param.style.height = h - 40 + "px";
        }
    },
    mounted() {
        this.listenContainer();
    }
};
</script>
<style scoped>
.box-card-container {
    height: 99%;
}
.box-card-in {
    margin-left: 5px;
}
.box-card-vertical {
    margin-top: 5px;
}
</style>
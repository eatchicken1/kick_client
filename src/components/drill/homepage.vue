<template>
    <div>
        <div align="center">
            <h1 style="margin-top: 50px"><i class="el-icon-s-custom"></i>欢迎使用《事故复杂预警子系统》</h1>
            <div style="font-size:30px">新疆油田</div>
            <div style="margin-top: 50px; width: 1200px; height: 600px">
                <el-carousel indicator-position="outside" :autoplay="true" :interval="15000" :loop="true" height="500px">
                    <el-carousel-item>
                        <img style="width: 1200px; height: 800px" src="../../assets/wellcomeImg/Welcomephoto_05.jpg" />
                    </el-carousel-item>
                   
                    <el-carousel-item>
                        <img style="width: 1200px; height: 800px" src="../../assets/wellcomeImg/Welcomephoto_07.jpg" />
                    </el-carousel-item>
                  
                </el-carousel>
            </div>
        </div>

        <div>版本：Ver1.0Beta</div>
        <div><span>版权所有：中国石油新疆油田有限公司</span><span class="text">西南石油大学智能钻井技术团队研发</span></div>
        <div class="container1">
            <span>井身质量规范</span>
            <el-divider></el-divider>
            <el-row>
                <el-col :span="8">
                    <draw-item :realtimeData="realtimeData"></draw-item>
                    <span>井身质量规范</span>
                    <el-divider></el-divider>
                    <el-form :model="WellQuality">
                        <el-form-item label="全角变化率"> </el-form-item>
                        <el-form-item label="着陆点位置"> </el-form-item>
                        <el-form-item label="纵横偏移"> </el-form-item>
                        <el-form-item label="靶区半径"> </el-form-item>
                        <el-form-item label="最大井斜角"> </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <optim-parameter :BestDrillParameter="BestDrillParameter" :WOB="WOB" :RPM="RPM" :ROP="ROP"></optim-parameter>
                    <current-para :BestDrillParameter="BestDrillParameter"></current-para>
                </el-col>
                <el-col :span="4">
                    <show-item :drillVribation="drillVribation"></show-item>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import DrawItem from './components/DrawItem';
import ShowItem from './components/ShowItem';
import HomeHeader from './components/HomeHeader';
import OptimParameter from './components/OptimParameter';
import CurrentPara from './components/CurrentPara';
export default {
    name: 'homepage',
    components: {
        DrawItem,
        ShowItem,
        HomeHeader,
        OptimParameter,
        CurrentPara
    },
    data() {
        return {
            realtimeData: [],
            drillVribation: [],
            BestDrillParameter: [],
            WOB: [],
            RPM: [],
            ROP: [],
            depth: 0,
            tableData: [],
            WellQuality: {}
        };
    },
    methods: {
        headerStyle() {
            return 'text-align:center';
        },
        cellStyle() {
            return 'text-align:center';
        }
    },
    mounted() {}
};
</script>

<style scoped>
.text {
    display: flex;
    flex-direction: row-reverse;
}
</style>
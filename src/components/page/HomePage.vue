<template>
    <el-card >
        <div align="center">
            <div style="width: 100%; height: 20%">
                <h1 style="margin-top: 20px"><i class="el-icon-s-custom"></i>欢迎使用《事故复杂预警子系统》</h1>
                <div style="font-size: 30px"> </div>
                 <!-- <div style="font-size: 30px"> 新疆油田数据中心</div> -->
            </div>
            <div style="margin-top: 50px; width: 90%; height: 70%">
                <el-carousel indicator-position="outside" :autoplay="true" :interval="15000" :loop="true" height="520px">
                    <el-carousel-item>
                        <img style="width: 100%; height: 100%" src="../../assets/wellcomeImg/Welcomephoto_05.jpg" />
                    </el-carousel-item>
                   
                    <el-carousel-item>
                        <img style="width: 100%; height: 100%" src="../../assets/wellcomeImg/Welcomephoto_07.jpg" />
                    </el-carousel-item>
                    <el-carousel-item>
                        <img style="width: 100%; height: 100%" src="../../assets/wellcomeImg/Welcomephoto_08.jpg" />
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>
        <div style="margin-top: 3%;margin-bottom: 1%; ">
            <div>版本：Ver1.0Beta</div>
            <div>
                <el-col :span="18">
                    <span>版权所有： 新疆油田数据中心</span>
                </el-col>
                <el-col :span="6">
                    <span class="text">西南石油大学智能钻井技术团队研发</span>
                </el-col>
            </div>
        </div>
    </el-card>
</template>

<script>
export default {
    name: 'homepage',
    mounted(){
        console.log(this.$store.state)
    }
};
</script>

<style>
.text {
    display: flex;
    flex-direction: row-reverse;
}
</style>
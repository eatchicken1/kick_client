<template>
  <div>
    <el-row class="home-head">
          <el-col :span="3">当前工况： 正常钻进</el-col>
          <el-col :span="5">
              <el-row>                 
                  <el-col :span="8"> 钻井效率： </el-col>
                  <el-col :span="14"><el-progress :text-inside="true" :stroke-width="20" :percentage="80" status="exception"></el-progress></el-col>
              </el-row>
          </el-col>
          <el-col :span="3">推荐钻压KN：{{this.$store.state.city}}</el-col>
          <el-col :span="3">推荐转速r/min： 120</el-col>
      </el-row>
  </div>
</template>

<script>
export default {
  name:'HomeHeader'
}
</script>

<style lang="stylus" scoped>
.home-head {
    margin: 5px 0px 0px 10px;
}
</style>
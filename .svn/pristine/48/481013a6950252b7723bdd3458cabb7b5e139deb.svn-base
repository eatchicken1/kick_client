<template>
<div>
    <div class="div-content">实时监测</div>
  <div class="page-items">
     <div>
      <span class="label">当前钻头实时磨损等级：</span>
      <span class="value">2</span>
    </div>
    <div>
      <span class="label">当前地层孔隙压力MPa：</span>
      <span class="value">30</span>
    </div>
    <div>
      <span class="label">井底循环当量压力MPa：</span>
      <span class="value">32</span>
    </div>
    <div>
      <span class="label">钻柱粘滑振动周期s：</span>
      <span class="value">{{drillVribation}}</span>
    </div>
    <div>
      <span class="label">当前地层可钻性极值：</span>
      <span class="value">5</span>
    </div>
    <div>
      <span class="label">井眼轨迹交碰风险系数：</span>
      <span class="value">10%</span>
    </div>
    <div>
      <span class="label">井眼轨迹着陆中靶指数：</span>
      <span class="value">90%</span>
    </div>
  </div>
</div>

</template>

<script>
export default {
  name:'ShowItem',
  props:{
    drillVribation:''
  },
   
}
</script>

<style scoped>
.page-items {
    height: 560px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top :20px;
    margin-left :20px;
}
.page-items .label {
    width: 180px;
    text-align: left;
    position: absolute;
}

.page-items .value {
    width: 73px;
    text-align: left;
    position: absolute;
    margin-left: 170px;
    padding-top: 4px;
}
.div-content {
    text-align: center;
    font-size: 20px;
    background-color: #ccc;
}

</style>
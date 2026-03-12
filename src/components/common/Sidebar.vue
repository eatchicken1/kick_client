<template>
    <div class="sidebar">
        <!-- 侧边栏颜色 background-color="#324157"   -->
        <el-menu
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="collapse"
            background-color="#324157"  
           
            text-color="#bfcbd9" 
            active-text-color="#20a0ff" 
            unique-opened 
            router
           
        >
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">{{
                                    threeItem.title
                                }}</el-menu-item>
                            </el-submenu>
                            <el-menu-item v-else :index="subItem.index" :key="'subItem-' + subItem.index">{{ subItem.title }}</el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i>
                        <span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
import bus from '../common/bus';
export default {
    data() {
        return {
            collapse: false,
            items: [
                {
                    icon: 'el-icon-lx-home',
                    index: '0',
                    title: '系统首页'
                },               
                {
                    icon: 'el-icon-collection',
                    index: '1',
                    title: '监测井基础数据',
                    subs: [
                       
                        {
                            index: 'threePressureProfile',
                            title: '三压力剖面数据'
                        },
                        {
                            index: 'survey',
                            title: '实钻井眼轨迹数据'
                        },
                        {
                            index: 'wellStructure',
                            title: '实钻井身结构数据'
                        },
                        {
                            index: 'bha',
                            title: '实钻钻具组合数据'
                        },
                        {
                            index: 'mud',
                            title: '实钻钻井液数据'
                        },
                        {
                            index: 'bit',
                            title: '实钻钻头数据'
                        },
                       
                    ]
                },
                  {
                    icon: 'el-icon-collection',
                    index: '2',
                    title: '水平井卡钻风险预测',
                    subs: [         
                        {
                            index: 'friction',
                            title: '井壁摩擦系数反演计算'
                        },                      
                        {
                            index: 'RIHPOOHload',
                            title: '起下钻井口载荷监测与评价'
                        },
                          {
                            index: 'RIHPOOHload2',
                            title: '带测量起下钻井口载荷监测与评价'
                        },
                        {
                            index: 'Rotatingtorque',
                            title: '空转扭矩监测'
                        },
                       
                           {
                            index: 'RIHPOOHload4',
                            title: '起下钻井口载荷实时监测'
                        },
                    ]
                },
                 {
                    icon: 'el-icon-time',
                    index: '6',
                    title: '钻井复杂风险实时预警模块',
                    subs: [
                        {
                            index: 'overflow',
                            title: '事故复杂实时预警1'
                        },
                       {
                            index: 'overflow2',
                            title: '事故复杂实时预警2'
                        },
                        {
                            index: '6',
                            title: '⑥钻井工况测试页面'
                        },
                         {
                            index: '7',
                            title: '岩性随钻识别'
                        },
                        {
                            index: 'ComprehensiveAnomaly',
                            title: '综合异常检测'
                        }
                    ]
                },
                {
                    icon: 'el-icon-reading',
                    index: '3',
                    title: '钻井复杂辅助计算模块',
                    subs: [
                         {
                            index: 'friction',
                            title: '①井壁摩擦系数反演计算'
                        },  
                        // {
                        //     index: 'HoleFcCalc',
                        //     title: '①钻柱与井壁间摩擦系数计算'
                        // },
                        {
                            index: 'porepressure',
                            title: '②地层孔隙压力预测'
                        },
                        {
                            index: 'wellboremudloss',
                            title: '③地层漏失压力计算'
                        },
                        {
                            index: 'SumMseCalc',
                            title: '④钻头总比能计算'
                        },
                    ]
                },
                {
                    icon: 'el-icon-warning-outline',
                    index: '4',
                    title: '钻井复杂风险辅助分析模块',
                    subs: [
                        {
                            index: 'RIHPOOHload',
                            title: '①起下钻井口载荷监测与评价'
                        },
                         {
                            index: 'Double',
                            title: '①起下钻井口载荷监测与评价'
                        },
                        // {
                        //     index: 'TripAnalysis',
                        //     title: '①起下钻悬重计算与实测对比'
                        // },
                          {
                            index: 'Rotatingtorque',
                            title: '②空转扭矩监测'
                        },
                        // {
                        //     index: 'TorqueOffBottom',
                        //     title: '②空转扭矩计算与实测对比'
                        // },
                          {
                            index: 'HKLAcalc',
                            title: '悬重计算与实测对比'
                        },
                    ]

                },
                {
                    icon: 'el-icon-notebook-2',
                    index: '5',
                    title: '钻井复杂处理工程计算模块',
                    subs: [
                        {
                            index: 'volume1',
                            title: '①井筒容积计算'
                        },
                        {
                            index: 'annularRheology',
                            title: '②钻井液计算'
                        },
                        {
                            index: 'DrillPipeMechanics',
                            title: '③管柱计算'
                        },
                        {
                            index: 'DrillingfluidMixture',
                            title: '④钻井液混合计算'
                        },
                        {
                            index: 'DrillingpipePressure',
                            title: '⑤管内及环空压耗计算'
                        },
                        {
                            index: 'WellboreClean',
                            title: '⑥井眼净化计算'
                        },
                        {
                            index: 'WellControl',
                            title: '⑦井控计算'
                        },
                        {
                            index: 'stuckreleased',
                            title: '⑧解卡计算'
                        },
                        {
                            index: 'DrillBitParameter',
                            title: '⑨钻头水力参数计算'
                        },
                    ]
                },

            ]
        };
    },
    computed: {
        onRoutes() {
            return this.$route.path.replace('/', '');
        }
    },
    created() {
        // 通过 Event Bus 进行组件间通信，来折叠侧边栏
        bus.$on('collapse', (msg) => {
            this.collapse = msg;
            bus.$emit('collapse-content', msg);
        });
    }
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}
.sidebar > ul {
    height: 100%;
}
</style>

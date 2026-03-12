import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '0'
        },
        {
            path: '/',
            component: () => import('../components/common/Home.vue'),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '0',
                    component: () => import('../components/page/HomePage.vue'),

                    meta: { title: '系统首页' }
                },
                {
                    path: 'threePressureProfile',
                    component: () => import('../components/page/basic/threePressureProfile'),
                    meta: { title: '三压力剖面数据' }
                },

                {
                    path: 'designTrajectory',
                    component: () => import('../components/page/basic/designTrajectory'),
                    meta: { title: '设计轨迹数据' }
                },
                {
                    path: 'survey',
                    component: () => import('../components/page/basic/survey'),
                    meta: { title: '实钻轨迹数据' }
                },
                {
                    path: 'wellStructure',
                    component: () => import('../components/page/basic/wellStructure'),
                    meta: { title: '实钻井身结构数据' }
                },
                {
                    path: 'bha',
                    component: () => import('../components/page/basic/bha'),
                    meta: { title: '实钻钻具组合数据' }
                },
                {
                    path: 'mud',
                    component: () => import('../components/page/basic/mud'),
                    meta: { title: '实钻钻井液数据' }
                },
                {
                    path: 'bit',
                    component: () => import('../components/page/basic/bit'),
                    meta: { title: '实钻钻头数据' }
                },
              

               
                {
                    path: 'HKLAcalc',
                    component: () => import('../components/page/HKLAcalc'),
                    meta: { title: '悬重计算与实测对比' }
                },
                        
                {
                    path: 'friction',
                    component: () => import('../components/page/WallFriction'),
                    meta: { title: '井壁摩擦系数反演计算' }
                },
                {
                    path: 'wellheadload',
                    component: () => import('../components/page/DrillingWellheadload'),
                    meta: { title: '钻进井口载荷实时监测' }
                },
                {
                    path: 'RIHPOOHload',
                    component: () => import('../components/page/LiftingDecentralizing'),
                    meta: { title: '起下钻钩载实时监测' }
                },
                {
                    path: 'Double',
                    component: () => import('../components/page/LiftingDecentralizingDouble'),
                    meta: { title: '起下钻钩载实时监测' }
                },
                {
                    path: 'RIHPOOHload2',
                    component: () => import('../components/page/LiftingDecentralizing2'),
                    meta: { title: '带测量起下钻钩载实时监测' }
                },
                {
                    path: 'Rotatingtorque',
                    component: () => import('../components/page/TorqueOffBottom'),
                    meta: { title: '空转扭矩实时监测' }
                },
                {
                    path: '6',
                    component: () => import('../components/page/Activestatus.vue'),
                    meta: { title: '钻井工况测试页面' }
                },
                {
                    path: 'RIHPOOHload3',
                    component: () => import('../components/page/LiftingDecentralizing4'),
                    meta: { title: '实际摩阻系数起下钻钩载实时监测' }
                },
                {
                    path: 'RIHPOOHload4',
                    component: () => import('../components/page/LiftingDecentralizing7'),
                    meta: { title: '起下钻钩载实时监测' }
                }, 
                   
                    {
                        path: 'volume1',
                        component: () => import('../components/page/calc/volume1.vue'),
                        meta: { title: '井筒容积计算' }
                    },
                   
                    {
                        path: 'annularRheology',
                        component: () => import('../components/page/calc/annularRheology.vue'),
                        meta: { title: '流变参数计算' }
                    }, {
                        path: 'DrillBitParameter',
                        component: () => import('../components/page/calc/DrillBitParameter.vue'),
                        meta: { title: '钻头水力参数计算' }
                    }, {
                        path: 'DrillingfluidMixture',
                        component: () => import('../components/page/calc/DrillingfluidMixture.vue'),
                        meta: { title: '钻井液混合计算' }
                    }, {
                        path: 'DrillingpipePressure',
                        component: () => import('../components/page/calc/DrillingpipePressure.vue'),
                        meta: { title: '管内及环空压耗计算' }
                    }, {
                        path: 'DrillPipeMechanics',
                        component: () => import('../components/page/calc/DrillPipeMechanics.vue'),
                        meta: { title: '管柱计算' }
                    }, {
                        path: 'stuckreleased',
                        component: () => import('../components/page/calc/stuckreleased.vue'),
                        meta: { title: '解卡计算' }
                    }, {
                        path: 'wellcontrol',
                        component: () => import('../components/page/calc/wellcontrol.vue'),
                        meta: { title: '井控计算' }
                    }, {
                        path: 'WellboreClean',
                        component: () => import('../components/page/calc/WellboreClean.vue'),
                        meta: { title: '井眼清洁计算' }
                    }, {
                        path: 'TorqueOffBottom',
                        component: () => import('../components/page/TorqueOffBottom.vue'),
                        meta: { title: '钻柱空转地面扭矩计算' }
                    }, {
                        path: 'TripAnalysis',
                        component: () => import('../components/page/assistant-analyse/TripAnalysis.vue'),
                        meta: { title: '起下钻井口载荷计算' }
                    },
                    {
                        path: 'wellboremudloss',
                        component: () => import('../components/page/assistant-analyse/wellboremudloss.vue'),
                        meta: { title: '漏失压力计算' }
                    }, {
                        path: 'HoleFcCalc',
                        component: () => import('../components/page/assistant-analyse/HoleFcCalc.vue'),
                        meta: { title: '钻柱与井壁摩擦系数计算' }
                    }
                    , {
                        path: 'overflow',
                        component: () => import('../components/page/Earlywarning.vue'),
                        meta: { title: '事故复杂实时预警' }
                    },
                    {
                        path: 'overflow2',
                        component: () => import('../components/page/Earlywarning2.vue'),
                        meta: { title: '事故复杂实时预警' }
                    },
                     {
                        path: 'porepressure',
                        component: () => import('../components/page/assistant-analyse/porepressure.vue'),
                        meta: { title: '地层孔隙压力计算' }
                    },
                     {
                        path: 'SumMseCalc',
                        component: () => import('../components/page/assistant-analyse/SumMseCalc.vue'),
                        meta: { title: '钻头总比能计算' }
                    }, {
                        path: '6',
                        component: () => import('../components/page/Activestatus.vue'),
                        meta: { title: '钻井工况测试页面' }
                    },
                    {
                        path: '7',
                        component: () => import('../components/page/assistant-analyse/lithology.vue'),
                        meta: { title: '岩性随钻识别' }
                    },
                    {
                        path: 'ComprehensiveAnomaly',
                        component: () => import('../components/page/assistant-analyse/ComprehensiveAnomaly.vue'),
                        meta: { title: '综合异常检测' }
                    }
                

            ]
        },

        {
            path: '/login',
            component: () => import('../components/page/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '*',
            redirect: '/404'
        },
        {
            path: '/HoleSelect',
            component: () => import('../components/page/HoleSelect.vue'),
            meta: { title: '井眼选择' }
        },



    ]
});

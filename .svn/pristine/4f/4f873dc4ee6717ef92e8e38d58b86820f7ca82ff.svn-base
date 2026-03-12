import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist';

Vue.use(Vuex)
const vuexLocal = new VuexPersist({
  storage: window.localStorage  // 可选，sessionStorage/indexDB
})
export default new Vuex.Store({
  state: {
    jh: '龙004-X1',
    StartTime: '2013/06/15 01:40:39',
    MoveCondition: "旋转钻进",
    CasingFc: 0.2,
    HoleFc: 0.3,
    isViscousEffect: true,
    swimG: 300,
    tor:10,
    Loss:10
  },
  actions: {

  },
  mutations: {
    getBaseData(state, data) {
      state.jh = data.jh;
      state.StartTime = data.StartTime;
    }
  },
  plugins: [vuexLocal.plugin]
})
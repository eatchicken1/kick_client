<template>
    <div class="container" id="container-drag">
        <el-row>
            <el-col :span="9">
                <el-card body-style="min-height: 400px;">
                    <div slot="header" class="clearfix">
                        <span>钻具选择</span>
                    </div>
                    <el-collapse accordion>
                        <div v-for="item in data" :key="item.id">
                            <el-collapse-item :title="item.label" style="margin-top: 2px">
                                <draggable
                                    v-bind="dragOptions"
                                    :list="item.children"
                                    @end="end"
                                    @clone="clone"
                                    :group="{ name: 'people', pull: 'clone', put: false }"
                                    @change="log"
                                >
                                    <transition-group tag="div" :id="item.label" :key="item.id">
                                        <div v-for="param in item.children" :key="param.id">
                                            <card-image :info="param"></card-image>
                                        </div>
                                    </transition-group>
                                </draggable>
                            </el-collapse-item>
                        </div>
                    </el-collapse>
                </el-card>
            </el-col>

            <el-col :span="9">
                <el-card body-style="min-height: 400px;">
                    <div slot="header" class="clearfix">
                        <span>钻具组合</span>
                    </div>
                    <draggable
                        class="dragArea list-group"
                        :list="selectedData"
                        :group="{ name: 'people1', put: true }"
                        v-bind="dragOptions"
                        @start="combinationStart"
                        @end="combinationEnd"
                        @change="log"
                    >
                        <transition-group tag="div" id="doing" class="item-ul-combination">
                            <div v-for="item in selectedData" class="drag-list" :key="item.id">
                                <img :src="item.url" class="image-combination" :alt="item.label" />
                            </div>
                        </transition-group>
                    </draggable>
                </el-card>
            </el-col>
            <transition name="fade">
                <el-card
                    v-if="isDeleteShow"
                    style="height: 150px; width: 150px; position: absolute; right: -30px; top: -30px"
                    body-style="height:100%;width:100%;padding:0px"
                >
                    <span class="el-icon-delete item-icon-deleted"></span>
                    <draggable
                        :list="deletedData"
                        @add="deleteListAdd"
                        :group="{ name: 'people2', put: true, pull: false }"
                        v-bind="dragOptions"
                    >
                        <transition-group tag="div" id="deleted" class="item-ul-delete">
                            <div v-for="item in deletedData" class="drag-list-delete" :key="item.id">
                                <el-tag>{{ item.label }}</el-tag>
                            </div>
                        </transition-group>
                    </draggable>
                </el-card>
            </transition>
        </el-row>
    </div>
</template>

<script>
import draggable from 'vuedraggable';
import CardImage from './CardImage';

const bhzData = [
    {
        label: '钻头',
        id: 1,
        children: [
            {
                label: 'PDC钻头',
                url: require('@/assets/img/pdc.jpg'),
                id: 2
            },
            {
                label: '牙轮钻头',
                url: require('@/assets/img/yl.jpg'),
                id: 3
            },
            {
                label: '刮刀转头',
                url: require('@/assets/img/gd.jpg'),
                id: 4
            }
        ]
    },
    {
        label: '扩眼工具',
        id: 5,
        children: [
            {
                label: '扩眼器',
                url: '',
                id: 6
            },
            {
                label: '扩眼钻头',
                url: '',
                id: 7
            }
        ]
    },
    {
        label: '钻杆',
        id: 8,
        children: [
            {
                label: '钻杆1',
                url: '',
                id: 9
            },
            {
                label: '钻杆2',
                url: '',
                id: 10
            }
        ]
    }
];
export default {
    name: 'draglist',
    data() {
        return {
            dragOptions: {
                animation: 120,
                scroll: true,
                // group: 'sortlist',
                ghostClass: 'ghost-style'
            },
            // 相关数据
            data: [],
            deletedData: [],
            selectedData: [],
            isDeleteShow: false
        };
    },
    components: {
        draggable,
        CardImage
    },
    mounted() {
        this.getBHZData();
    },
    methods: {
        getBHZData() {
            this.data = bhzData;
        },
        log(event) {
            console.log(this.doing);
            console.log(event);
        },
        end(e) {
            console.log(e);
        },
        clone(e) {
            console.log(e);
        },
        combinationStart() {
            this.isDeleteShow = true;
        },
        combinationEnd() {
            this.isDeleteShow = false;
        },
        deleteListAdd(e) {
            console.log(e);
            this.deletedData = [];
        }
    }
};
</script>

<style>
#container-drag .el-collapse-item__content {
    padding-bottom: 0px;
}
.item-ul-combination {
    min-height: 400px;
}
.image-combination {
    width: 40%;
    border: 1px solid gray;
    margin-top: -5px;
    margin-left: 5%;
}
.item-ul-delete {
    width: 100%;
    height: 150px;
    background: #c0392b;
    opacity: 0.9;
}
.drag-list-delete {
    padding-top: 20px;
    padding-left: 40px;
}
.item-icon-deleted {
    font-size: 50px;
    position: absolute;
    z-index: 100;
    /* top: 44px; */
    /* right: 105px; */
    margin-top: 44px;
    margin-left: 51px;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>

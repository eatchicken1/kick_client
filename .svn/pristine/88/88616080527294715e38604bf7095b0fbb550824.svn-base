<template>
    <div class="assemblycontainer" id="container-drag">
        <!-- <el-col :span="5"> -->
        <div style="min-width: 250px">
            <el-card body-style="min-height: 400px;">
                <div slot="header" class="clearfix">
                    <span>钻具选择</span>
                </div>
                <el-collapse accordion>
                    <div v-for="item in data" :key="item.label">
                        <el-collapse-item :title="item.label" style="margin-top: 2px">
                            <draggable
                                v-bind="dragOptions"
                                :list="item.children"
                                @end="end"
                                @clone="clone"
                                :group="{ name: 'people', pull: 'clone', put: false }"
                                @change="log"
                            >
                                <transition-group tag="div" :id="item.label" :key="item.label">
                                    <div v-for="param in item.children" :key="param.label">
                                        <card-image :info="param"></card-image>
                                    </div>
                                </transition-group>
                            </draggable>
                        </el-collapse-item>
                    </div>
                </el-collapse>
            </el-card>
        </div>
        <div style="min-width: 250px">
            <el-card body-style="min-height: 400px;">
                <div slot="header" class="clearfix-select">
                    <span>钻具组合示意图</span>

                    <div>
                        <el-tooltip class="item" effect="dark" :content="isShowText ? '隐藏名称' : '显示名称'" placement="top">
                            <el-switch style="margin-right: 8px" v-model="isShowText" @change="isShowTextChange"> </el-switch>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="下载图片" placement="right-start">
                            <i @click="downloadImage" style="cursor: pointer" class="el-icon-download"></i>
                        </el-tooltip>
                    </div>
                </div>
                <draggable
                    class="dragArea list-group"
                    :list="selectedData"
                    :group="{ name: 'people1', put: true }"
                    v-bind="dragOptions"
                    @start="combinationStart"
                    @end="combinationEnd"
                    @change="imageChange"
                >
                    <transition-group tag="div" id="doing" class="item-ul-combination">
                        <div v-for="item in selectedData" class="drag-list" :key="item.label">
                            <img :src="item.url" class="image-combination" :alt="item.label" />
                            <span class="drag-list-span" :style="isShowText ? '' : 'display: none'">{{ item.label }}</span>
                        </div>
                    </transition-group>
                </draggable>
            </el-card>
        </div>
        <transition name="fade">
            <el-card
                v-if="isDeleteShow"
                style="height: 150px; width: 150px; position: absolute; opacity: 0.9"
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
                        <div v-for="item in deletedData" class="drag-list-delete" :key="item.label">
                            <el-tag>{{ item.label }}</el-tag>
                        </div>
                    </transition-group>
                </draggable>
            </el-card>
        </transition>
    </div>
</template>

<script>
import draggable from 'vuedraggable';
import CardImage from './CardImage';
import { assemblyData } from './assembly';
import html2canvas from 'html2canvas';
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}
export default {
    name: 'draglist',
    props: {
        dataList: {
            type: Array
        }
    },
    data() {
        return {
            dragOptions: {
                animation: 120,
                scroll: true,
                // group: 'sortlist',
                ghostClass: 'ghost-style'
            },
            // 钻具组合是否显示文字
            isShowText: true,
            // 相关数据
            data: assemblyData,
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
        console.log(assemblyData);
        let tempData = [];
        if (this.dataList) {
            assemblyData.forEach((value) => {
                value.children.forEach((item) => {
                    this.dataList.forEach((data) => {
                        if (data.label == item.label) {
                            tempData.push({
                                id: data.id,
                                url: item.url,
                                label: item.label
                            });
                        }
                    });
                });
            });
            this.selectedData = tempData;
        }
    },
    methods: {
        // 图片下载
        downloadImage() {
            if (this.selectedData.length < 3) {
                this.$message.error('请至少选择三个及其以上钻具');
                return;
            }
            const dom = document.getElementById('doing');
            html2canvas(dom).then((canvas) => {
                // dom.append(canvas);
                let link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.setAttribute('download', '钻具组合.png');
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
            });
        },
        // swich开关值得变化
        isShowTextChange(value) {
            const dragListSpan = document.getElementsByClassName('drag-list-span');
            console.log(dragListSpan);
            for (const element of dragListSpan) {
                if (value) {
                    element.style.display = '';
                } else {
                    element.style.display = 'none';
                }
            }
        },
        log(event) {
            // console.log(event);
        },
        async getBase64() {
            const dom = document.getElementById('doing');
            let result = await html2canvas(dom).then();
            return result.toDataURL();;
        },
        imageChange(event) {
            let element = event.added.element;
            let tempData = this.selectedData;
            for (let i = 0; i < tempData.length; i++) {
                if (tempData[i].label == element.label && typeof tempData[i].id == 'undefined') {
                    console.log(typeof tempData[i].id);
                    tempData[i].id = guid();
                }
            }
            this.selectedData = tempData;
            const dom = document.getElementById('doing');
            html2canvas(dom).then((canvas) => {
                let base64 = canvas.toDataURL();
                this.$emit('onChange', this.selectedData, base64);
            });
        },
        end(e) {
            // console.log(e);
        },
        clone(evt) {
            // console.log(evt);
        },
        combinationStart() {
            this.isDeleteShow = true;
        },
        combinationEnd() {
            this.isDeleteShow = false;
        },
        deleteListAdd(e) {
            // console.log(e);
            this.deletedData = [];
        }
    }
};
</script>

<style>
.assemblycontainer {
    display: flex;
}
.assemblycontainer .clearfix-select {
    display: flex;
    justify-content: space-between;
}
.assemblycontainer #container-drag .el-collapse-item__content {
    padding-bottom: 0px;
}
.assemblycontainer .item-ul-combination {
    min-height: 400px;
    width: fit-content;
    padding-right: 15px;
}
.assemblycontainer .image-combination {
    width: 87px;
    /* border: 1px solid gray; */
    margin-top: -5px;
    /* margin-left: 5%; */
}
.assemblycontainer .item-ul-delete {
    width: 100%;
    height: 150px;
    background: #c0392b;
    opacity: 0.9;
}
.assemblycontainer .drag-list {
    position: relative;
    display: flex;
    /* justify-content: center; */
    /* align-content: center; */
    align-items: center;
}
.assemblycontainer .drag-list-span {
    width: fit-content;
    font-size: 13px;
}
.assemblycontainer .drag-list-delete {
    padding-top: 20px;
    padding-left: 40px;
}
.assemblycontainer .item-icon-deleted {
    font-size: 50px;
    position: absolute;
    z-index: 100;
    /* top: 44px; */
    /* right: 105px; */
    margin-top: 44px;
    margin-left: 51px;
}
.assemblycontainer .fade-enter-active,
.assemblycontainer .fade-leave-active {
    transition: opacity 0.3s;
}
.assemblycontainer .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>

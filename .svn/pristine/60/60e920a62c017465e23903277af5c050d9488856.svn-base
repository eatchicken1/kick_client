<template>
    <el-card :body-style="{ padding: '0px' }">
        <div class="image-label">
            <div class="image-comtainer">
                <img :src="info.url" class="image-list" />
            </div>
            <div class="text-comtainer">
                <span class="text">{{ info.label }}</span>
            </div>
        </div>
    </el-card>
</template>

<script>
export default {
    name: 'CardImage',
    props: {
        info: {
            type: Object,
            default: {}
        }
    }
};
</script>

<style>
.text {
    font-size: 13px;
    color: #999;
}
.text-comtainer{
    padding-left: 5px;
}
.image-comtainer{
    height: 25px;
    width: 25px;
}
.image-label {
    padding: 14px;
    display: flex;
    justify-content: flex-start;
}
.image-list {
    width: 100%;
    height: 100%;
}
</style>
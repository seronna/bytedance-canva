<template>
  <div class="shape-style-panel p-4 bg-white border-l border-gray-200 h-full w-64 flex flex-col gap-4 shadow-sm z-10">
    <h3 class="text-sm font-bold text-gray-700 border-b pb-2">图形样式</h3>
    
    <!-- 填充颜色 -->
    <div class="flex flex-col gap-2">
      <label class="text-xs text-gray-500 font-medium">填充颜色</label>
      <div class="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
        <input type="color" v-model="fillColorHex" class="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent" />
        <span class="text-xs text-gray-600 font-mono">{{ fillColorHex.toUpperCase() }}</span>
      </div>
      <!-- 预定义颜色 -->
      <div class="grid grid-cols-6 gap-1.5">
        <button
          v-for="color in presetColors"
          :key="color"
          @click="fillColorHex = color"
          :style="{ backgroundColor: color }"
          class="w-5 h-5 rounded border-2 transition-all hover:scale-110"
          :class="fillColorHex.toLowerCase() === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'"
          :title="color"
        />
      </div>
    </div>

    <!-- 描边颜色 -->
    <div class="flex flex-col gap-2">
      <label class="text-xs text-gray-500 font-medium">描边颜色</label>
      <div class="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
        <input type="color" v-model="strokeColorHex" class="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent" />
        <span class="text-xs text-gray-600 font-mono">{{ strokeColorHex.toUpperCase() }}</span>
      </div>
      <!-- 预定义颜色 -->
      <div class="grid grid-cols-6 gap-1.5">
        <button
          v-for="color in presetColors"
          :key="color"
          @click="strokeColorHex = color"
          :style="{ backgroundColor: color }"
          class="w-5 h-5 rounded border-2 transition-all hover:scale-110"
          :class="strokeColorHex.toLowerCase() === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'"
          :title="color"
        />
      </div>
    </div>

    <!-- 描边宽度 -->
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <label class="text-xs text-gray-500 font-medium">描边宽度</label>
        <span class="text-xs text-gray-400">{{ strokeWidth }}px</span>
      </div>
      <input 
        type="range" 
        v-model.number="strokeWidth" 
        min="0" 
        max="20" 
        step="1"
        class="w-full accent-blue-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'

const props = defineProps<{
  orchestrator: RenderOrchestrator
}>()

// 预定义颜色选项
const presetColors = [
  '#000000', '#FFFFFF', '#3b82f6', '#C0C0C0', '#FF0000', '#800000',
]

// 辅助函数：数字颜色转 Hex 字符串
const numberToHex = (num: number) => '#' + num.toString(16).padStart(6, '0')
// 辅助函数：Hex 字符串转数字
const hexToNumber = (hex: string) => parseInt(hex.replace('#', ''), 16)

// 初始化状态
const currentStyle = props.orchestrator.getShapeStyle()
const fillColorHex = ref(numberToHex(currentStyle.fillColor))
const strokeColorHex = ref(numberToHex(currentStyle.strokeColor))
const strokeWidth = ref(currentStyle.strokeWidth)

// 监听变化并同步回 Orchestrator
watch([fillColorHex, strokeColorHex, strokeWidth], () => {
  props.orchestrator.setShapeStyle({
    fillColor: hexToNumber(fillColorHex.value),
    strokeColor: hexToNumber(strokeColorHex.value),
    strokeWidth: strokeWidth.value
  })
})
</script>

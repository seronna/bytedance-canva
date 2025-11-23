<template>
  <div class="shape-style-panel p-4 bg-white border-l border-gray-200 h-full w-64 flex flex-col gap-4 shadow-sm z-10">
    <h3 class="text-sm font-bold text-gray-700 border-b pb-2">
      图形样式
    </h3>

    <!-- 填充颜色 -->
    <div class="flex flex-col gap-2">
      <label class="text-xs text-gray-500 font-medium">填充颜色</label>
      <div class="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
        <input v-model="fillColorHex" type="color" class="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent">
        <span class="text-xs text-gray-600 font-mono">{{ fillColorHex.toUpperCase() }}</span>
      </div>
      <!-- 预定义颜色 -->
      <div class="grid grid-cols-6 gap-1.5">
        <button
          v-for="color in presetColors"
          :key="color"
          :style="{ backgroundColor: color }"
          class="w-5 h-5 rounded border-2 transition-all hover:scale-110"
          :class="fillColorHex.toLowerCase() === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'"
          :title="color"
          @click="fillColorHex = color"
        />
      </div>
    </div>

    <!-- 描边颜色 -->
    <div class="flex flex-col gap-2">
      <label class="text-xs text-gray-500 font-medium">描边颜色</label>
      <div class="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
        <input v-model="strokeColorHex" type="color" class="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent">
        <span class="text-xs text-gray-600 font-mono">{{ strokeColorHex.toUpperCase() }}</span>
      </div>
      <!-- 预定义颜色 -->
      <div class="grid grid-cols-6 gap-1.5">
        <button
          v-for="color in borderPresentColors"
          :key="color"
          :style="{ backgroundColor: color }"
          class="w-5 h-5 rounded border-2 transition-all hover:scale-110"
          :class="strokeColorHex.toLowerCase() === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'"
          :title="color"
          @click="strokeColorHex = color"
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
        v-model.number="strokeWidth"
        type="range"
        min="0"
        max="20"
        step="1"
        class="w-full accent-blue-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/useEditorStore'

const editorStore = useEditorStore()

// 预定义颜色选项

const presetColors = [
  '#000000',
  '#FFFFFF',
  '#3b82f6',
  '#C0C0C0',
  '#FF0000',
  '#800000',
]
const borderPresentColors = [
  '#000000',
  '#CE423B',
  '#529C4F',
  '#3770BC',
  '#E39134',
  '#903DAF',
]

// 辅助函数：数字颜色转 Hex 字符串
const numberToHex = (num: number) => `#${num.toString(16).padStart(6, '0')}`
// 辅助函数：Hex 字符串转数字
const hexToNumber = (hex: string) => Number.parseInt(hex.replace('#', ''), 16)

// 使用 computed 双向绑定 Store 数据
const fillColorHex = computed({
  get: () => numberToHex(editorStore.shapeStyle.fillColor),
  set: (val: string) => editorStore.updateShapeStyle({ fillColor: hexToNumber(val) }),
})

const strokeColorHex = computed({
  get: () => numberToHex(editorStore.shapeStyle.strokeColor),
  set: (val: string) => editorStore.updateShapeStyle({ strokeColor: hexToNumber(val) }),
})

const strokeWidth = computed({
  get: () => editorStore.shapeStyle.strokeWidth,
  set: (val: number) => editorStore.updateShapeStyle({ strokeWidth: val }),
})
</script>

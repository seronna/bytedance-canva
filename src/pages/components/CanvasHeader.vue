<template>
  <div class="absolute top-4 left-0 right-0 z-50 pointer-events-none flex justify-center">
    <div class="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-6 py-2 pointer-events-auto flex items-center gap-4 border border-gray-200/50">
      <!-- 左侧：项目信息 -->
      <div class="flex items-center gap-2 font-medium text-sm text-gray-800 border-r pr-4 mr-2">
        <SidebarTrigger class="mr-2" />
        <span class="hidden md:inline">untitled</span>
      </div>

      <!-- 工具栏 -->
      <div class="flex items-center gap-2">
        <!-- 工具选择 -->
        <div class="flex gap-1">
          <button
            :class="['p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95',
                     currentTool === 'select' ? 'bg-blue-500 text-white shadow-blue-200 shadow-md' : 'text-gray-600 hover:bg-gray-100']"
            @click="emit('update:currentTool', 'select')"
            title="选择工具 (V)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
          </button>
        </div>

        <div class="w-px h-6 bg-gray-200 mx-1"></div>

        <!-- 图形创建 -->
        <div class="flex gap-1">
          <button
            :class="['p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95',
              currentTool === 'rect' ? 'bg-blue-500 text-white shadow-blue-200 shadow-md' : 'text-gray-600 hover:bg-gray-100']"
            @click="emit('update:currentTool', 'rect')"
            title="矩形工具 (R)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
          </button>
          <button
            :class="['p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95',
              currentTool === 'circle' ? 'bg-blue-500 text-white shadow-blue-200 shadow-md' : 'text-gray-600 hover:bg-gray-100']"
            @click="emit('update:currentTool', 'circle')"
            title="圆形工具 (C)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SidebarTrigger } from "../../components/ui/sidebar"

defineProps<{
  currentTool: string
}>()

const emit = defineEmits<{
  (e: 'update:currentTool', value: string): void
}>()
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="overflow-x-hidden">
      <!-- 顶部工具栏 -->
      <CanvasHeader v-model:current-tool="currentTool" />

      <!-- Main Content -->
      <div class="flex flex-1 flex-col gap-0 h-full overflow-hidden bg-gray-50 relative">
        <div class="flex flex-1 h-full overflow-hidden">
          <!-- 画布容器 -->
          <div
            ref="containerRef"
            class="flex-1 bg-gray-100 overflow-hidden relative"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @wheel="handleWheel"
          >
            <!-- Layer 1: Pixi WebGL 层 -->
            <canvas ref="pixiCanvasRef" class="absolute inset-0 w-full h-full" style="z-index: 1;" />

            <!-- Layer 2: Canvas2D 层 -->
            <canvas ref="canvas2DRef" class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 2;" />

            <!-- Layer 3: DOM 层（选择框、文本编辑器、控制点） -->
            <div ref="domOverlayRef" class="absolute inset-0 w-full h-full" style="z-index: 3; pointer-events: none;" />

            <!-- 缩放比例显示 -->
            <div class="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-sm font-medium text-gray-700 border border-gray-200" style="z-index: 4">
              {{ zoomLevel }}%
            </div>
          </div>

          <!-- 形状样式面板 -->
          <ShapeStylePanel
            v-if="showStylePanel"
            :orchestrator="orchestrator!"
            class="border-l border-gray-200 bg-white z-10"
          />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import AppSidebar from '../components/AppSidebar.vue'
import ShapeStylePanel from '../components/ShapeStylePanel.vue'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import CanvasHeader from './components/CanvasHeader.vue'
import { useCanvasEvents } from './composables/useCanvasEvents'
import { useCanvasOrchestrator } from './composables/useCanvasOrchestrator'

// -------------------- 状态管理 --------------------
const currentTool = ref('select')

// -------------------- 组合式函数 --------------------
const {
  pixiCanvasRef,
  canvas2DRef,
  domOverlayRef,
  containerRef,
  zoomLevel,
  getOrchestrator,
  orchestrator,
} = useCanvasOrchestrator()

const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
} = useCanvasEvents(getOrchestrator, containerRef)

const showStylePanel = computed(() => {
  return ['rect', 'circle'].includes(currentTool.value) && orchestrator.value
})

// -------------------- 工具切换逻辑 --------------------
watch(currentTool, (newTool) => {
  const orchestrator = getOrchestrator()
  if (!orchestrator)
    return

  // 通过 ToolManager 切换工具（自动处理激活/停用）
  orchestrator.getToolManager().setActiveTool(newTool as any)
})
</script>

<style scoped>
</style>

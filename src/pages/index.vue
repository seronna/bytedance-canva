<script setup lang="ts">
import AppSidebar from "../components/AppSidebar.vue"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar"
import { RenderOrchestrator } from "../canvas/core/RenderOrchestrator"

// -------------------- 画布引用 --------------------
const pixiCanvasRef = ref<HTMLCanvasElement | null>(null) // Pixi WebGL 层
const canvas2DRef = ref<HTMLCanvasElement | null>(null)   // Canvas2D 辅助层
const domOverlayRef = ref<HTMLElement | null>(null)       // DOM 交互层
const containerRef = ref<HTMLElement | null>(null)        // 画布容器

// 渲染编排器（统一管理三层渲染）
let orchestrator: RenderOrchestrator | null = null

// -------------------- 交互状态 --------------------
// 操作模式（平移、选择、框选）
type InteractionMode = 'pan' | 'select' | null
const currentMode = ref<InteractionMode>(null)

// 平移相关
let isPanning = false
let lastMouseX = 0
let lastMouseY = 0

// 当前选中的工具（选择、文本、矩形、圆形）
type ToolType = 'select' | 'rect' | 'circle'
const currentTool = ref<ToolType>('select')

// 绘制模式状态
let isDrawing = false
let drawStartX = 0
let drawStartY = 0
let previewShapeId: string | null = null

// 缩放比例显示
const zoomLevel = ref<number>(100)

// -------------------- 工具切换处理 --------------------
watch(currentTool, (newTool) => {
  if (!orchestrator) return
  
  const pixiManager = orchestrator.getPixiManager()
  
  // 绘制模式下禁用图形交互
  if (newTool === 'rect' || newTool === 'circle') {
    pixiManager.setInteractionEnabled(false)
  } else {
    pixiManager.setInteractionEnabled(true)
  }
})

// -------------------- 初始化画布 --------------------
onMounted(async () => {
  if (!pixiCanvasRef.value || !canvas2DRef.value || !domOverlayRef.value || !containerRef.value) {
    console.error('[App] 画布元素未找到')
    return
  }

  // 获取容器尺寸
  const rect = containerRef.value.getBoundingClientRect()
  console.log('[App] 画布容器尺寸:', rect.width, rect.height)
  const width = rect.width
  const height = rect.height

  // 初始化渲染编排器
  orchestrator = new RenderOrchestrator()
  await orchestrator.init(
    pixiCanvasRef.value,
    canvas2DRef.value,
    domOverlayRef.value,
    width,
    height
  )

  // 示例形状：在 Pixi 中绘制一个矩形
  const pixiManager = orchestrator.getPixiManager()
  // for(let i = 0; i < 50; i++) {
  //   for(let j = 0; j < 10; j++) {
  //     const color = Math.floor(Math.random() * 0xffffff)
  //     pixiManager.addRect(10 + i * 110, 10 + j * 110, 100, 100, color)
  //   }
  // }
  pixiManager.addRect(100, 100, 200, 150, 0x3b82f6) // 蓝色矩形
  pixiManager.addCircle(400, 150, 80, 0xef4444)     // 红色圆形

  // 监听视口变化，更新缩放比例显示
  orchestrator.getViewport().onChange((state) => {
    zoomLevel.value = Math.round(state.scale * 100)
  })

  console.log('[App] 画布初始化完成')

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 使用 ResizeObserver 监听容器尺寸变化（侧边栏收缩/展开会改变容器尺寸）
  let resizeTimer: number | null = null
  const resizeObserver = new ResizeObserver(() => {
    // 防抖处理，避免频繁触发
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = window.setTimeout(() => {
      nextTick(() => {
        handleResize()
      })
    }, 50)
  })
  
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
  
  // 清理 ResizeObserver
  onUnmounted(() => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeObserver.disconnect()
  })
})

// -------------------- 销毁清理 --------------------
onUnmounted(() => {
  if (orchestrator) {
    orchestrator.destroy()
    orchestrator = null
  }
  window.removeEventListener('resize', handleResize)
})

// -------------------- 窗口 resize 处理 --------------------
const handleResize = () => {
  if (!containerRef.value || !orchestrator) return

  const rect = containerRef.value.getBoundingClientRect()
  // 防止尺寸为 0 或过小导致渲染异常
  if (rect.width < 10 || rect.height < 10) {
    console.warn('[App] 容器尺寸异常:', rect.width, rect.height)
    return
  }
  
  console.log('[App] 画布容器 resize:', rect.width, rect.height)
  orchestrator.resize(rect.width, rect.height)
}

// -------------------- 鼠标事件处理 --------------------
// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  if (!orchestrator || !containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const screenX = e.clientX - rect.left
  const screenY = e.clientY - rect.top
  const viewport = orchestrator.getViewport().getState()
  
  // 将屏幕坐标转换为世界坐标
  const worldX = (screenX - viewport.x) / viewport.scale
  const worldY = (screenY - viewport.y) / viewport.scale
  
  // 按住空格键或 Shift：平移模式
  if (e.shiftKey) {
    isPanning = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    currentMode.value = 'pan'
    e.preventDefault()
    return
  }
  
  //绘制图形模式（矩形、圆形、椭圆）
  if (currentTool.value === 'rect' || currentTool.value === 'circle') {
    isDrawing = true
    drawStartX = worldX
    drawStartY = worldY
    currentMode.value = null
    
    // 创建预览图形
    const pixiManager = orchestrator.getPixiManager()
    const randomColor = 0x3b82f6
    console.log('[App] 开始绘制图形，起点坐标:', drawStartX, drawStartY)
    console.log(currentTool.value)
    if (currentTool.value === 'rect') {
      previewShapeId = pixiManager.addRect(worldX, worldY, 1, 1, randomColor)
    } else if (currentTool.value === 'circle') {
      previewShapeId = pixiManager.addCircle(worldX, worldY, 1, randomColor)
    }
    return
  }
  console.log("当前模式"+currentTool.value)
  // 选择工具模式
  if (currentTool.value === 'select') {
    // 尝试点击选中图形
    const pixiManager = orchestrator.getPixiManager()
    const hitShapeId = pixiManager.hitTest(screenX, screenY, viewport)
    if (hitShapeId) {
      // 点击到了图形，选中它
      pixiManager.selectShape(hitShapeId)
      console.log('[App] 选中图形:', hitShapeId)
    } else {
      // 没有点击到图形，清除选择
      pixiManager.clearSelection()
    }
  }
}

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!orchestrator || !containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const screenX = e.clientX - rect.left
  const screenY = e.clientY - rect.top
  const viewport = orchestrator.getViewport().getState()

  // 平移模式
  if (isPanning) {
    const dx = e.clientX - lastMouseX
    const dy = e.clientY - lastMouseY
    orchestrator.getViewport().pan(dx, dy)
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    return
  }

  // 绘制模式：更新预览图形
  if (isDrawing && previewShapeId) {
    const worldX = (screenX - viewport.x) / viewport.scale
    const worldY = (screenY - viewport.y) / viewport.scale
    const pixiManager = orchestrator.getPixiManager()
    const shape = pixiManager.getShape(previewShapeId)

    if (!shape) return
    if (currentTool.value === 'rect') {
      const width = Math.abs(worldX - drawStartX)
      const height = Math.abs(worldY - drawStartY)
      const x = Math.min(worldX, drawStartX)
      const y = Math.min(worldY, drawStartY)
      shape.setPosition(x, y)
      // 使用类型断言调用 RectNode 的 setSize 方法
      if ('setSize' in shape) {
        (shape as any).setSize(width, height)
      }
    } else if (currentTool.value === 'circle') {
      const dx = worldX - drawStartX
      const dy = worldY - drawStartY
      const radius = Math.sqrt(dx * dx + dy * dy)
      // 使用类型断言调用 CircleNode 的 setRadius 方法
      if ('setRadius' in shape) {
        (shape as any).setRadius(radius)
      }
    }
    return
  }
}

// 鼠标松开
const handleMouseUp = () => {
  if (!orchestrator || !containerRef.value) return
  // 结束平移
  if (isPanning) {
    isPanning = false
    currentMode.value = null
    return
  }
  
  // 结束绘制：完成图形
  if (isDrawing) {
    isDrawing = false
    previewShapeId = null
    drawStartX = 0
    drawStartY = 0
    currentMode.value = null
    // 切换回选择工具
    //currentTool.value = 'select'
    return
  }
}

// 鼠标滚轮缩放
const handleWheel = (e: WheelEvent) => {
  if (!orchestrator || !containerRef.value) return

  e.preventDefault()

  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const delta = e.deltaY > 0 ? -0.1 : 0.1
  orchestrator.getViewport().zoom(delta, mouseX, mouseY)
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="overflow-x-hidden">
      <!-- 顶部工具栏 -->
      <div class="bg-white/95 backdrop-blur-sm shadow-md z-50" style="box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05)">
        <div class="flex items-center h-12">
          <!-- 左侧：项目信息 -->
          <div class="mr-auto flex items-center gap-2 px-4 font-medium text-sm text-gray-800">
            <SidebarTrigger class="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbLink href="#">
                    我的设计
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator class="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>untitled</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <!-- 工具栏 -->
          <div class="flex flex-wrap gap-2 items-center mx-auto">
            <!-- 工具选择 -->
            <div class="flex gap-1 border-r pr-3">
              <button
                :class="['px-3 py-2 text-sm border rounded transition-colors',
                         currentTool === 'select' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white']"
                @click="currentTool = 'select'"
                title="选择工具 (V)"
              >
                选择
              </button>
            </div>

            <!-- 图形创建 -->
            <div class="flex gap-1 border-r pr-3">
              <button
                :class="[
                  'px-3 py-2 text-sm border rounded transition-colors',
                  currentTool === 'rect' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'
                ]"
                @click="currentTool = 'rect'"
                title="矩形工具 (R)"
              >
                矩形
              </button>
              <button
                :class="[
                  'px-3 py-2 text-sm border rounded transition-colors',
                  currentTool === 'circle' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'
                ]"
                @click="currentTool = 'circle'"
                title="圆形工具 (C)"
              >
                圆形
              </button>
            </div>

            <!-- 操作提示 -->
            <!-- <div class="text-sm text-gray-600 flex-1">
              <span v-if="currentTool === 'select'">
                💡 点击选中 | 拖拽移动 | 框选多选
              </span>
              <span v-else-if="currentTool === 'text'">
                💡 点击画布添加文本
              </span>
              <span v-else-if="currentTool === 'rect'">
                💡 点击并拖拽绘制矩形
              </span>
              <span v-else-if="currentTool === 'circle'">
                💡 点击并拖拽绘制圆形（从中心向外）
              </span>
              <span v-else-if="currentTool === 'ellipse'">
                💡 点击并拖拽绘制椭圆
              </span>
            </div> -->

            <!-- 视图控制 -->
            <div class="text-xs text-gray-500 border-l pl-3">
              Shift + 拖拽 = 平移 | 滚轮 = 缩放
            </div>
          </div>

          <!-- 右侧：预留空间 -->
          <div class="ml-auto flex items-center gap-2 px-4"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex flex-1 flex-col gap-0 h-[calc(100vh-48px)] overflow-hidden bg-gray-50">
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
          <!-- Layer 1: Pixi WebGL 层（主渲染） -->
          <canvas
            ref="pixiCanvasRef"
            class="absolute inset-0 w-full h-full"
            style="z-index: 1;border: 1px solid red;"
            
          />

          <!-- Layer 2: Canvas2D 层（辅助渲染：框选、辅助线等） -->
          <canvas
            ref="canvas2DRef"
            class="absolute inset-0 w-full h-full pointer-events-none"
            style="border: 1px solid blue; z-index: 2;"
          />

          <!-- Layer 3: DOM 层（UI、文本输入、交互控件） -->
          <div
            ref="domOverlayRef"
            class="absolute inset-0 w-full h-full pointer-events-none"
            style="z-index: 3;border: 1px solid green;"
          >
            <!-- DOM 元素可以在这里添加 -->
          </div>

          <!-- 缩放比例显示 -->
          <div
            class="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-sm font-medium text-gray-700 border border-gray-200"
            style="z-index: 4"
          >
            {{ zoomLevel }}%
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
</style>

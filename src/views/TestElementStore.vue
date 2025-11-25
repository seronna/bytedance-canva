<template>
  <div class="test-container">
    <h2>Element Store 测试页面</h2>

    <div class="controls">
      <button @click="add">添加元素</button>
      <button @click="removeLast" :disabled="elements.length === 0">
        删除最后一个元素
      </button>
      <button @click="moveFirst" :disabled="elements.length === 0">
        移动第一个元素 (dx=10, dy=5)
      </button>
      <button @click="clearAll" :disabled="elements.length === 0">清空</button>
    </div>

    <h3>画布（可拖拽元素）</h3>
    <div class="canvas" ref="canvasEl">
      <div
        v-for="el in elements"
        :key="el.id"
        class="preview-el"
        :style="elStyle(el)"
        @mousedown.prevent="startDrag(el, $event)"
      >
        {{ el.type }} ({{ el.id.slice(-4) }})
      </div>
    </div>

    <h3>当前元素列表（刷新页面也会保留）</h3>
    <pre>{{ elements }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useElementsStore } from '@/stores/elements'
import type { Element } from '@/cores/types/element'

const store = useElementsStore()

onMounted(() => {
  store.loadFromLocal()
})

// 使用 storeToRefs 保持响应式引用，避免直接读取属性后丢失响应性
const { elements } = storeToRefs(store)

// 添加元素
const add = () => {
  store.addElement({
    type: 'shape',
    x: 20 + Math.floor(Math.random() * 200),
    y: 20 + Math.floor(Math.random() * 120),
    width: 120,
    height: 80,
  })
}

// 删除最后一个
const removeLast = () => {
  const last = elements.value[elements.value.length - 1]
  if (last) store.removeElement(last.id)
}

// 移动第一个元素
const moveFirst = () => {
  const first = elements.value[0]
  if (first) store.moveElement(first.id, 10, 5)
}

const clearAll = () => {
  store.clear()
}

// 拖拽逻辑（简单相对移动）
const dragging = ref<{ id: string; startX: number; startY: number } | null>(
  null
)
const canvasEl = ref<HTMLElement | null>(null)

function startDrag(el: Element, event: MouseEvent) {
  dragging.value = { id: el.id, startX: event.clientX, startY: event.clientY }
}

function onPointerMove(e: MouseEvent) {
  if (!dragging.value) return
  const dX = e.clientX - dragging.value.startX
  const dY = e.clientY - dragging.value.startY
  // 更新起点以支持连续移动
  dragging.value.startX = e.clientX
  dragging.value.startY = e.clientY
  store.moveElement(dragging.value.id, dX, dY)
}

function onPointerUp() {
  dragging.value = null
}

onMounted(() => {
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
})

const elStyle = (el: Element) => ({
  left: `${el.x}px`,
  top: `${el.y}px`,
  width: `${el.width}px`,
  height: `${el.height}px`,
})
</script>

<style scoped>
.test-container {
  padding: 20px;
  font-family: sans-serif;
}

.controls {
  margin-bottom: 12px;
}

button {
  margin-right: 10px;
  padding: 6px 12px;
}

.canvas {
  width: 720px;
  height: 360px;
  border: 1px dashed #ccc;
  position: relative;
  background: #fafafa;
  margin-bottom: 12px;
  overflow: hidden;
}

.preview-el {
  position: absolute;
  background: #fff;
  border: 1px solid #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  font-size: 12px;
}
</style>

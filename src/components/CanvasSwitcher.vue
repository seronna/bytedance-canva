<template>
  <div class="flex items-center gap-2">
    <!-- 当前画布显示 + 切换下拉菜单 -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm" class="gap-2">
          {{ canvasStore.activeCanvas?.name || '未选择画布' }}
          <ChevronDown class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-64">
        <div class="px-2 py-1.5 text-xs font-semibold text-gray-500">
          我的画布
        </div>
        <DropdownMenuSeparator />

        <div v-for="canvas in canvasStore.canvasList" :key="canvas.id">
          <DropdownMenuItem
            class="flex items-center justify-between group"
            @click="canvasStore.switchCanvas(canvas.id)"
          >
            <span
              :class="{ 'font-semibold': canvas.id === canvasStore.activeCanvasId }"
            >
              {{ canvas.name }}
            </span>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="p-1 hover:bg-gray-100 rounded"
                @click.stop="handleRenameCanvas(canvas.id, canvas.name)"
              >
                <Edit2 class="h-3 w-3" />
              </button>
              <button
                v-if="canvasStore.canvasList.length > 1"
                class="p-1 hover:bg-red-100 hover:text-red-600 rounded"
                @click.stop="handleDeleteCanvas(canvas.id, canvas.name)"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem class="gap-2" @click="handleCreateCanvas">
          <Plus class="h-4 w-4" />
          <span>新建画布</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- 快速新建按钮 -->
    <Button variant="ghost" size="sm" @click="handleCreateCanvas">
      <Plus class="h-4 w-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Edit2, Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCanvasStore } from '@/stores/useCanvasStore'

const canvasStore = useCanvasStore()

function handleCreateCanvas() {
  // eslint-disable-next-line no-alert
  const name = prompt('输入新画布名称：', `画布 ${canvasStore.canvasCount + 1}`)
  if (name) {
    canvasStore.createCanvas(name)
  }
}

function handleRenameCanvas(id: string, currentName: string) {
  // eslint-disable-next-line no-alert
  const name = prompt('重命名画布：', currentName)
  if (name && name !== currentName) {
    canvasStore.renameCanvas(id, name)
  }
}

function handleDeleteCanvas(id: string, name: string) {
  // eslint-disable-next-line no-alert
  if (confirm(`确定要删除画布"${name}"吗？`)) {
    canvasStore.deleteCanvas(id)
  }
}
</script>

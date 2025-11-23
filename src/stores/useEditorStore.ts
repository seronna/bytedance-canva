/**
 * useEditorStore.ts - 编辑器全局状态
 * 适合用 Pinia 管理的状态：需要跨组件共享、持久化、历史记录
 */

import type { ShapeStyle } from '@/canvas/core/RenderOrchestrator'
import type { ToolName } from '@/types/tool'
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', {
    state: () => ({
        // ==================== 工具状态 ====================
        currentTool: 'select' as ToolName,

        // ==================== 图形样式 ====================
        shapeStyle: {
            fillColor: 0x3B82F6,
            strokeColor: 0x000000,
            strokeWidth: 1,
        } as ShapeStyle,

        // ==================== UI 状态 ====================
    }),

    actions: {
        // 切换工具
        setTool(tool: ToolName) {
            this.currentTool = tool
        },

        // 更新样式
        updateShapeStyle(updates: Partial<ShapeStyle>) {
            this.shapeStyle = { ...this.shapeStyle, ...updates }
        },

    },

    // 持久化配置（用户偏好保存到 localStorage）
    persist: {
        storage: localStorage,
        paths: ['shapeStyle'],
    } as any,
})

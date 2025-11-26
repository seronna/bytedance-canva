/**
 * useCanvasStore.ts - 画布管理
 * 管理多个画布实例，支持创建、切换、删除画布
 */

import { defineStore } from 'pinia'

export interface CanvasItem {
    id: string
    name: string
    createdAt: number
    updatedAt: number
    thumbnail?: string // 画布缩略图（可选）
}

export const useCanvasStore = defineStore('canvas', {
    state: () => ({
        // 当前激活的画布 ID
        activeCanvasId: null as string | null,

        // 所有画布列表
        canvasList: [] as CanvasItem[],
    }),

    getters: {
        // 获取当前画布
        activeCanvas: (state) => {
            return state.canvasList.find(c => c.id === state.activeCanvasId)
        },

        // 获取画布数量
        canvasCount: state => state.canvasList.length,
    },

    actions: {
        /**
         * 创建新画布
         */
        createCanvas(name?: string): string {
            const id = `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
            const canvas: CanvasItem = {
                id,
                name: name || `画布 ${this.canvasList.length + 1}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            this.canvasList.push(canvas)

            // 自动切换到新画布
            this.activeCanvasId = id

            return id
        },

        /**
         * 切换画布
         */
        switchCanvas(canvasId: string): boolean {
            const canvas = this.canvasList.find(c => c.id === canvasId)
            if (!canvas) {
                console.warn(`画布不存在: ${canvasId}`)
                return false
            }
            this.activeCanvasId = canvasId
            return true
        },

        /**
         * 删除画布
         */
        deleteCanvas(canvasId: string): boolean {
            const index = this.canvasList.findIndex(c => c.id === canvasId)
            if (index === -1) {
                return false
            }

            this.canvasList.splice(index, 1)

            // 如果删除的是当前画布，切换到第一个画布
            if (this.activeCanvasId === canvasId) {
                this.activeCanvasId = this.canvasList.length > 0 ? this.canvasList[0]!.id : null
            }

            return true
        },

        /**
         * 重命名画布
         */
        renameCanvas(canvasId: string, newName: string): boolean {
            const canvas = this.canvasList.find(c => c.id === canvasId)
            if (!canvas) {
                return false
            }
            canvas.name = newName
            canvas.updatedAt = Date.now()
            return true
        },

        /**
         * 更新画布缩略图
         */
        updateThumbnail(canvasId: string, thumbnail: string): boolean {
            const canvas = this.canvasList.find(c => c.id === canvasId)
            if (!canvas) {
                return false
            }
            canvas.thumbnail = thumbnail
            canvas.updatedAt = Date.now()
            return true
        },

        /**
         * 初始化：如果没有画布，创建默认画布
         */
        initDefaultCanvas(): void {
            if (this.canvasList.length === 0) {
                this.createCanvas('画布 1')
            }
            else if (!this.activeCanvasId && this.canvasList[0]) {
                this.activeCanvasId = this.canvasList[0].id
            }
        },
    },

    // 持久化画布列表
    persist: {
        storage: localStorage,
        paths: ['canvasList', 'activeCanvasId'],
    } as any,
})

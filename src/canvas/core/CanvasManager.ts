/**
 * CanvasManager.ts - Canvas2D 辅助渲染管理器
 * 职责：管理 Canvas2D 上下文，用于绘制临时内容（框选框、辅助线、悬停效果等）
 */

import type { ViewportState } from './Viewport'

export class CanvasManager {
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private currentViewport: ViewportState = { x: 0, y: 0, scale: 1 }

    /**
     * 初始化 Canvas2D
     */
    init(canvas: HTMLCanvasElement, width: number, height: number): void {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')

        if (!this.ctx) {
            console.error('[CanvasManager] 无法获取 2D 上下文')
            return
        }

        // 设置画布尺寸
        canvas.width = width
        canvas.height = height

        console.log('[CanvasManager] 初始化完成')
    }

    /**
     * 调整画布大小
     */
    resize(width: number, height: number): void {
        if (!this.canvas) return
        this.canvas.width = width
        this.canvas.height = height
    }

    /**
     * 同步 Viewport 的 transform（保存状态，供绘制时使用）
     */
    syncViewport(state: ViewportState): void {
        this.currentViewport = state
    }

    /**
     * 清空画布
     */
    clear(): void {
        if (!this.ctx || !this.canvas) return
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    /**
     * 应用 Viewport transform 到 Canvas 上下文（在绘制前调用）
     */
    applyTransform(): void {
        if (!this.ctx) return
        this.ctx.save()
        this.ctx.translate(this.currentViewport.x, this.currentViewport.y)
        this.ctx.scale(this.currentViewport.scale, this.currentViewport.scale)
    }

    /**
     * 恢复 Canvas 上下文的 transform
     */
    restoreTransform(): void {
        if (!this.ctx) return
        this.ctx.restore()
    }

    /**
     * 获取 Canvas2D 上下文（供外部直接绘制）
     */
    getContext(): CanvasRenderingContext2D | null {
        return this.ctx
    }

    /**
     * 示例：绘制框选矩形（Rubber Band）
     */
    drawSelectionRect(x: number, y: number, width: number, height: number): void {
        if (!this.ctx) return

        this.clear()
        this.applyTransform()

        this.ctx.strokeStyle = '#0078d4'
        this.ctx.fillStyle = 'rgba(0, 120, 212, 0.1)'
        this.ctx.lineWidth = 1 / this.currentViewport.scale // 线宽不随缩放变化
        this.ctx.strokeRect(x, y, width, height)
        this.ctx.fillRect(x, y, width, height)

        this.restoreTransform()
    }

    /**
     * 销毁 Canvas
     */
    destroy(): void {
        this.canvas = null
        this.ctx = null
        console.log('[CanvasManager] 已销毁')
    }
}

/**
 * DrawingTool.ts - 绘制工具基类
 * 职责：封装通用的绘制流程，子类只需实现形状特定的逻辑
 */

import type { ShapeBase } from '../../canvas/objects/ShapeBase'
import type { PointerEvent } from '../../types/tool'
import { BaseTool } from './BaseTool'

/**
 * 绘制工具基类
 * 封装通用的绘制流程，子类只需实现形状特定的逻辑
 */
export abstract class DrawingTool extends BaseTool {
    protected isDrawing = false
    protected startX = 0
    protected startY = 0
    protected previewId: string | null = null
    // 最小拖拽距离阈值（像素），小于此值视为点击而非拖拽
    protected minDragDistance = 3

    override deactivate(): void {
        this.cleanup()
    }

    override onPointerDown(e: PointerEvent): void {
        this.isDrawing = true
        this.startX = e.worldX
        this.startY = e.worldY
        // 异步创建预览，不阻塞后续操作
        this.createPreview(e).then((id) => {
            this.previewId = id
        }).catch((err) => {
            console.error('创建预览图形失败:', err)
            this.cleanup()
        })
    }

    override onPointerMove(e: PointerEvent): void {
        if (!this.isDrawing || !this.previewId)
            return

        const shape = this.pixiManager.getShape(this.previewId)
        if (!shape)
            return
        this.updatePreview(shape, e)
    }

    override onPointerUp(e: PointerEvent): void {
        if (this.isDrawing && this.previewId) {
            // 检查是否有效拖拽（移动距离是否超过阈值）
            const dx = e.worldX - this.startX
            const dy = e.worldY - this.startY
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < this.minDragDistance) {
                // 只是点击或移动太小，删除预览图形
                this.deletePreview(this.previewId)
            }
            else {
                // 有效拖拽，保存最终的图形数据到 repository
                const idToSave = this.previewId
                this.pixiManager.updateShapeData(idToSave).catch((err) => {
                    console.error('保存图形数据失败:', err)
                })
            }
        }
        this.cleanup()
    }

    /**
     * 创建预览图形（子类必须实现）
     * @returns 返回创建的图形 ID
     */
    protected abstract createPreview(e: PointerEvent): Promise<string>

    /**
     * 删除预览图形
     */
    protected deletePreview(id: string): void {
        this.pixiManager.deleteShape(id).catch((err) => {
            console.error('删除预览图形失败:', err)
        })
    }

    /**
     * 更新预览图形
     * 子类实现具体的图形更新逻辑
     */
    protected abstract updatePreview(shape: ShapeBase, e: PointerEvent): void

    /**
     * 清理状态
     */
    protected cleanup(): void {
        this.isDrawing = false
        this.previewId = null
    }
}

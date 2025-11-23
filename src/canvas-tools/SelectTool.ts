import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { ShapeBase } from '../canvas/objects/ShapeBase'
import type { PointerEvent } from '../types/tool'
import { BaseTool } from './base/BaseTool'

/**
 * 选择工具
 * 负责：选中图形、拖拽移动、取消选择
 */
export class SelectTool extends BaseTool {
    readonly name = 'select' as const

    private selectedShapeIds: Set<string> = new Set()
    private draggingShape: ShapeBase | null = null
    private dragOffset = { x: 0, y: 0 }

    constructor(orchestrator: RenderOrchestrator) {
        super(orchestrator)
    }

    override activate(): void {
        // 激活时启用图形交互（可拖拽）
        this.enableShapeInteraction(true)
    }

    override deactivate(): void {
        // 停用时禁用图形交互
        this.enableShapeInteraction(false)
        this.clearSelection()
    }

    override onPointerDown(e: PointerEvent): void {
        // 命中测试
        const hitShapeId = this.pixiManager.getShapeAtPoint(e.screenX, e.screenY)
        if (hitShapeId) {
            this.selectShape(hitShapeId)
            this.startDrag(hitShapeId, e)
        }
        else {
            this.clearSelection()
        }
    }

    override onPointerMove(e: PointerEvent): void {
        if (!this.draggingShape)
            return

        const world = this.pixiManager.screenToWorld(e.screenX, e.screenY)
        this.draggingShape.setPosition(
            world.x - this.dragOffset.x,
            world.y - this.dragOffset.y,
        )
    }

    override onPointerUp(_e: PointerEvent): void {
        if (this.draggingShape) {
            // 保存拖拽后的位置
            this.pixiManager.updateShapeData(this.draggingShape.id).catch((err) => {
                console.error('保存图形位置失败:', err)
            })
            this.draggingShape = null
        }
    }

    private startDrag(shapeId: string, e: PointerEvent): void {
        const shape = this.pixiManager.getShape(shapeId)
        if (!shape)
            return

        this.draggingShape = shape
        const world = this.pixiManager.screenToWorld(e.screenX, e.screenY)
        const shapePos = shape.getPosition()
        this.dragOffset.x = world.x - shapePos.x
        this.dragOffset.y = world.y - shapePos.y
    }

    private selectShape(id: string): void {
        this.clearSelection()
        this.selectedShapeIds.add(id)
        const shape = this.pixiManager.getShape(id)
        if (shape) {
            shape.setSelected(true)
        }
    }

    private clearSelection(): void {
        this.selectedShapeIds.forEach((id) => {
            const shape = this.pixiManager.getShape(id)
            if (shape) {
                shape.setSelected(false)
            }
        })
        this.selectedShapeIds.clear()
    }

    private enableShapeInteraction(enabled: boolean): void {
        const shapes = this.pixiManager.getAllShapes()
        shapes.forEach((shape) => {
            shape.graphics.eventMode = enabled ? 'static' : 'none'
            shape.graphics.cursor = enabled ? 'move' : 'default'
        })
    }
}

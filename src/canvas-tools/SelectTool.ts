import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { PointerEvent } from '../types/tool'
import { BaseTool } from './base/BaseTool'

/**
 * 选择工具
 * 点击选中图形，点击空白取消选择
 */
export class SelectTool extends BaseTool {
    readonly name = 'select' as const

    constructor(orchestrator: RenderOrchestrator) {
        super(orchestrator)
    }

    override activate(): void {
        // 激活时启用 Pixi 交互
        this.pixiManager.setInteractionEnabled(true)
    }

    override onPointerDown(e: PointerEvent): void {
        // 命中测试
        const hitShapeId = this.pixiManager.hitTest(e.screenX, e.screenY)
        if (hitShapeId) {
            this.pixiManager.selectShape(hitShapeId)
        }
        else {
            this.pixiManager.clearSelection()
        }
    }
}

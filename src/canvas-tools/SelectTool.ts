import type { ITool, PointerEvent } from '../types/tool'
import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'

/**
 * 选择工具
 * 点击选中图形，点击空白取消选择
 */
export class SelectTool implements ITool {
    readonly name = 'select' as const
    private orchestrator: RenderOrchestrator

    constructor(orchestrator: RenderOrchestrator) {
        this.orchestrator = orchestrator
    }

    activate(): void {
        // 激活时启用 Pixi 交互
        this.orchestrator.getPixiManager().setInteractionEnabled(true)
    }

    deactivate(): void {
        // 停用时可选择性保留交互
    }

    onPointerDown(e: PointerEvent): void {
        const pixiManager = this.orchestrator.getPixiManager()
        const viewport = this.orchestrator.getViewport().getState()

        // 命中测试
        const hitShapeId = pixiManager.hitTest(e.screenX, e.screenY, viewport)
        if (hitShapeId) {
            pixiManager.selectShape(hitShapeId)
        } else {
            pixiManager.clearSelection()
        }
    }

    onPointerMove(): void {
        // 预留：拖拽选中形状的逻辑
    }

    onPointerUp(): void {
        // 预留：结束拖拽
    }
}

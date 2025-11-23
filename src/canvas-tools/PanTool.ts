import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { ITool, PointerEvent } from '../types/tool'

/**
 * 平移工具
 * 拖拽画布移动视口
 */
export class PanTool implements ITool {
    readonly name = 'pan' as const

    private isPanning = false
    private lastX = 0
    private lastY = 0
    private orchestrator: RenderOrchestrator

    constructor(orchestrator: RenderOrchestrator) {
        this.orchestrator = orchestrator
    }

    activate(): void {
        // 平移模式下禁用 Pixi 交互（避免误选）
        this.orchestrator.getPixiManager().setInteractionEnabled(false)
    }

    deactivate(): void {
        this.isPanning = false
    }

    onPointerDown(e: PointerEvent): void {
        this.isPanning = true
        this.lastX = e.clientX
        this.lastY = e.clientY
    }

    onPointerMove(e: PointerEvent): void {
        if (!this.isPanning)
            return

        const dx = e.clientX - this.lastX
        const dy = e.clientY - this.lastY
        this.orchestrator.getViewport().pan(dx, dy)

        this.lastX = e.clientX
        this.lastY = e.clientY
    }

    onPointerUp(): void {
        this.isPanning = false
    }
}

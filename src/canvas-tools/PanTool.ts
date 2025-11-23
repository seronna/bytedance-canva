import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { PointerEvent } from '../types/tool'
import { BaseTool } from './base/BaseTool'

/**
 * 平移工具
 * 拖拽画布移动视口
 */
export class PanTool extends BaseTool {
    readonly name = 'pan' as const

    private isPanning = false
    private lastX = 0
    private lastY = 0

    constructor(orchestrator: RenderOrchestrator) {
        super(orchestrator)
    }

    override deactivate(): void {
        this.isPanning = false
    }

    override onPointerDown(e: PointerEvent): void {
        this.isPanning = true
        this.lastX = e.clientX
        this.lastY = e.clientY
    }

    override onPointerMove(e: PointerEvent): void {
        if (!this.isPanning)
            return

        const dx = e.clientX - this.lastX
        const dy = e.clientY - this.lastY
        this.viewport.pan(dx, dy)

        this.lastX = e.clientX
        this.lastY = e.clientY
    }

    override onPointerUp(): void {
        this.isPanning = false
    }
}

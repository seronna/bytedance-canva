import type { ITool, PointerEvent } from '../types/tool'
import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'

/**
 * 圆形绘制工具
 */
export class CircleTool implements ITool {
    readonly name = 'circle' as const

    private orchestrator: RenderOrchestrator
    private isDrawing = false
    private startX = 0
    private startY = 0
    private previewId: string | null = null

    constructor(orchestrator: RenderOrchestrator) {
        this.orchestrator = orchestrator
    }

    activate(): void {
        this.orchestrator.getPixiManager().setInteractionEnabled(false)
    }

    deactivate(): void {
        this.isDrawing = false
        this.previewId = null
    }

    onPointerDown(e: PointerEvent): void {
        this.isDrawing = true
        this.startX = e.worldX
        this.startY = e.worldY
        const style = this.orchestrator.getShapeStyle()
        this.previewId = this.orchestrator.getPixiManager().addCircle(e.worldX, e.worldY, 1, style)
    }

    onPointerMove(e: PointerEvent): void {
        if (!this.isDrawing || !this.previewId) return

        const shape = this.orchestrator.getPixiManager().getShape(this.previewId)
        if (!shape) return

        const dx = e.worldX - this.startX
        const dy = e.worldY - this.startY
        const radius = Math.sqrt(dx * dx + dy * dy)

        if ('setRadius' in shape) (shape as any).setRadius(radius)
    }

    onPointerUp(): void {
        this.isDrawing = false
        this.previewId = null
    }
}

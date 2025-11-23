import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { ITool, PointerEvent } from '../types/tool'

/**
 * 矩形绘制工具
 */
export class RectTool implements ITool {
    readonly name = 'rect' as const

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
        this.previewId = this.orchestrator.getPixiManager().addRect(e.worldX, e.worldY, 1, 1, style)
    }

    onPointerMove(e: PointerEvent): void {
        if (!this.isDrawing || !this.previewId)
            return

        const shape = this.orchestrator.getPixiManager().getShape(this.previewId)
        if (!shape)
            return

        const width = Math.abs(e.worldX - this.startX)
        const height = Math.abs(e.worldY - this.startY)
        const x = Math.min(e.worldX, this.startX)
        const y = Math.min(e.worldY, this.startY)

        shape.setPosition(x, y)
        if ('setSize' in shape)
            (shape as any).setSize(width, height)
    }

    onPointerUp(): void {
        this.isDrawing = false
        this.previewId = null
    }
}

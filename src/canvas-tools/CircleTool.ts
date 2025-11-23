import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { CircleNode } from '../canvas/objects/CircleNode'
import type { ShapeBase } from '../canvas/objects/ShapeBase'
import type { PointerEvent } from '../types/tool'
import { DrawingTool } from './base/DrawingTool'

/**
 * 圆形绘制工具
 */
export class CircleTool extends DrawingTool {
    readonly name = 'circle' as const

    constructor(orchestrator: RenderOrchestrator) {
        super(orchestrator)
    }

    protected override async createPreview(e: PointerEvent): Promise<string> {
        const style = this.orchestrator.getShapeStyle()
        return await this.pixiManager.addShape({
            type: 'circle',
            x: e.worldX,
            y: e.worldY,
            radius: 1,
            color: style.fillColor,
            borderColor: style.strokeColor,
            borderWidth: style.strokeWidth,
        })
    }

    protected override updatePreview(shape: ShapeBase, e: PointerEvent): void {
        const dx = e.worldX - this.startX
        const dy = e.worldY - this.startY
        const radius = Math.sqrt(dx * dx + dy * dy)
            ; (shape as CircleNode).setRadius(radius)
    }
}

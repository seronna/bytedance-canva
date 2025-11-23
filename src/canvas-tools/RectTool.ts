import type { RenderOrchestrator } from '../canvas/core/RenderOrchestrator'
import type { RectNode } from '../canvas/objects/RectNode'
import type { ShapeBase } from '../canvas/objects/ShapeBase'
import type { PointerEvent } from '../types/tool'
import { DrawingTool } from './base/DrawingTool'

/**
 * 矩形绘制工具
 */
export class RectTool extends DrawingTool {
    readonly name = 'rect' as const

    constructor(orchestrator: RenderOrchestrator) {
        super(orchestrator)
    }

    protected override async createPreview(e: PointerEvent): Promise<string> {
        const style = this.orchestrator.getShapeStyle()
        return await this.pixiManager.addShape({
            type: 'rect',
            x: e.worldX,
            y: e.worldY,
            width: 1,
            height: 1,
            color: style.fillColor,
            borderColor: style.strokeColor,
            borderWidth: style.strokeWidth,
        })
    }

    protected override updatePreview(shape: ShapeBase, e: PointerEvent): void {
        const width = Math.abs(e.worldX - this.startX)
        const height = Math.abs(e.worldY - this.startY)
        const x = Math.min(e.worldX, this.startX)
        const y = Math.min(e.worldY, this.startY)

        shape.setPosition(x, y)
            ; (shape as RectNode).setSize(width, height)
    }
}

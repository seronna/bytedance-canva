/**
 * RectNode.ts - 矩形节点
 */

import { ShapeBase, type ShapeData } from './ShapeBase'

export class RectNode extends ShapeBase {
    constructor(data: ShapeData) {
        super({ ...data, type: 'rect' })
    }

    protected render(): void {
        const { width = 100, height = 100, color, borderColor = 0x000000, borderWidth = 2 } = this.data

        this.graphics.clear()

        // 绘制矩形（相对于图形的原点）
        this.graphics.rect(0, 0, width, height)
        this.graphics.fill(color)
        this.graphics.stroke({ width: borderWidth, color: borderColor })

        // 设置位置
        this.graphics.position.set(this.data.x, this.data.y)
    }

    /**
     * 更新尺寸
     */
    setSize(width: number, height: number): void {
        this.data.width = width
        this.data.height = height
        this.render()
    }
}

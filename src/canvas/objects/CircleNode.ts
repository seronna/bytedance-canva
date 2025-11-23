/**
 * CircleNode.ts - 圆形节点
 */

import type { ShapeData } from './ShapeBase'
import { ShapeBase } from './ShapeBase'

export class CircleNode extends ShapeBase {
    constructor(data: ShapeData) {
        super({ ...data, type: 'circle' })
    }

    protected render(): void {
        const { radius = 50, color, borderColor = 0x000000, borderWidth = 0.1 } = this.data

        this.graphics.clear()

        // 绘制圆形（以中心为原点）
        this.graphics.circle(radius, radius, radius)
        this.graphics.fill(color)
        this.graphics.stroke({ width: borderWidth, color: borderColor })

        // 设置位置
        this.graphics.position.set(this.data.x, this.data.y)
    }

    /**
     * 更新半径
     */
    setRadius(radius: number): void {
        this.data.radius = radius
        this.render()
    }
}

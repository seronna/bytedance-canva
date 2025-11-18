/**
 * ShapeBase.ts - 图形对象基类
 * 所有图形对象的抽象基类
 */

import { Graphics } from 'pixi.js'

// 导出接口
export interface ShapeData {
    id: string
    type: 'rect' | 'circle' | 'ellipse' | 'line' | 'text'
    x: number
    y: number
    width?: number
    height?: number
    radius?: number
    color: number
    borderColor?: number
    borderWidth?: number
    text?: string
    fontSize?: number
    rotation?: number
    // 可拖拽/可选中等状态
    draggable?: boolean
    selectable?: boolean
}

// 导出基类
export abstract class ShapeBase {
    public id: string
    public type: ShapeData['type']
    public graphics: Graphics
    protected data: ShapeData

    constructor(data: ShapeData) {
        this.id = data.id
        this.type = data.type
        this.data = data
        this.graphics = new Graphics()

        // 设置交互
        this.graphics.eventMode = 'static'
        this.graphics.cursor = 'move'

        // 初始化渲染
        this.render()
    }

    /**
     * 抽象方法：子类必须实现具体的渲染逻辑
     */
    protected abstract render(): void

    /**
     * 公共方法：触发重新渲染（供外部调用）
     */
    public updateAndRender(): void {
        this.render()
    }

    /**
     * 设置颜色
     */
    public setColor(color: number): void {
        this.data.color = color
        this.render()
    }

    /**
     * 更新位置
     */
    setPosition(x: number, y: number): void {
        this.data.x = x
        this.data.y = y
        this.graphics.position.set(x, y)
    }

    /**
     * 获取位置
     */
    getPosition(): { x: number; y: number } {
        return { x: this.data.x, y: this.data.y }
    }

    /**
     * 设置选中状态
     */
    setSelected(selected: boolean): void {
        if (selected) {
            this.graphics.tint = 0xaaccff
        } else {
            this.graphics.tint = 0xffffff
        }
    }

    /**
     * 获取边界框（用于碰撞检测）
     */
    getBounds(): { x: number; y: number; width: number; height: number } {
        const bounds = this.graphics.getBounds()
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        }
    }

    /**
     * 点击测试
     */
    hitTest(x: number, y: number): boolean {
        const bounds = this.getBounds()
        return x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.graphics.destroy()
    }

    /**
     * 获取数据快照
     */
    getData(): ShapeData {
        return { ...this.data }
    }
}

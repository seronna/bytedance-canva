/**
 * ShapeBase.ts - 图形对象基类
 * 所有图形对象的抽象基类
 */

import { Graphics } from 'pixi.js'

/**
 * 图形数据接口
 * 包括图形的基本属性，如位置、尺寸、颜色等
 * @param id 图形唯一标识符
 * @param type 图形类型（矩形、圆形等）
 * @param x 图形位置 X
 * @param y 图形位置 Y
 * @param width 图形宽度（可选，适用于矩形等）
 * @param height 图形高度（可选，适用于矩形等）
 * @param radius 图形半径（可选，适用于圆形等）
 * @param color 填充颜色
 * @param borderColor 边框颜色（可选）
 * @param borderWidth 边框宽度（可选）
 * @param text 文本内容（可选，适用于文本图形）
 * @param fontSize 字体大小（可选，适用于文本图形）
 * @param rotation 旋转角度（可选）
 * @param draggable 是否可拖拽（可选）
 * @param selectable 是否可选中（可选）
 */
export interface ShapeData {
    id: string
    type: 'rect' | 'circle' | 'ellipse' | 'line' | 'text' | 'image'
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

/**
 * 图形对象基类
 * 提供图形的基本属性和方法
 * @param id 图形唯一标识符
 * @param type 图形类型
 */
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

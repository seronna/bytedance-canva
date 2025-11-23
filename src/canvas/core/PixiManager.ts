/**
 * PixiManager.ts - Pixi WebGL 渲染管理器
 * 职责：管理 Pixi Application、主场景容器、图形渲染与生命周期
 *
 * 不负责：拖拽、选择等交互逻辑（由 Tool 层管理）
 */

import type { ShapeBase, ShapeData } from '../objects/ShapeBase'
import type { ViewportState } from './Viewport'
import type { IShapeRepository } from '@/services/data/IShapeRepository'
import { Application, Container } from 'pixi.js'
import { LocalRepository } from '@/services/data/LocalRepository'
import { CircleNode } from '../objects/CircleNode'
import { RectNode } from '../objects/RectNode'

export class PixiManager {
    private app: Application | null = null
    private mainContainer: Container | null = null
    private repository: IShapeRepository

    // 渲染缓存（仅用于渲染，数据持久化由 repository 负责）
    private shapes: Map<string, ShapeBase> = new Map()
    private currentViewport: ViewportState = { x: 0, y: 0, scale: 1 }

    constructor(repository?: IShapeRepository) {
        // 默认使用 LocalRepository，但支持注入自定义实现（如 CRDTRepository）
        this.repository = repository || new LocalRepository()
    }

    /**
     * 初始化 Pixi Application
     */
    async init(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
        this.app = new Application()
        await this.app.init({
            canvas,
            width,
            height,
            backgroundColor: 0xFFFFFF,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        })

        this.mainContainer = new Container()
        this.app.stage.addChild(this.mainContainer)

        console.log('[PixiManager] 初始化完成')
    }

    resize(width: number, height: number): void {
        if (!this.app)
            return
        this.app.renderer.resize(width, height)
    }

    syncViewport(state: ViewportState): void {
        if (!this.mainContainer)
            return
        this.currentViewport = state
        this.mainContainer.position.set(state.x, state.y)
        this.mainContainer.scale.set(state.scale, state.scale)
    }

    getMainContainer(): Container | null {
        return this.mainContainer
    }

    getApp(): Application | null {
        return this.app
    }

    getShape(id: string): ShapeBase | null {
        return this.shapes.get(id) ?? null
    }

    getAllShapes(): ShapeBase[] {
        return Array.from(this.shapes.values())
    }

    clear(): void {
        if (!this.mainContainer)
            return
        this.mainContainer.removeChildren()
    }

    destroy(): void {
        if (this.app) {
            this.app.destroy(true, { children: true })
            this.app = null
        }
        this.mainContainer = null
        console.log('[PixiManager] 已销毁')
    }

    /**
     * 通用的添加图形方法
     * @param shapeData 图形数据（不包含 id，由 repository 生成）
     * @returns 返回创建的图形 ID
     */
    async addShape(shapeData: Omit<ShapeData, 'id'>): Promise<string> {
        // 创建数据并保存到 repository
        const id = await this.repository.create(shapeData)

        // 直接渲染（repository.create 已经有完整数据）
        this.renderShape({ ...shapeData, id } as ShapeData)

        return id
    }

    /**
     * 删除图形（从渲染和持久化层移除）
     */
    async deleteShape(id: string): Promise<void> {
        const shape = this.shapes.get(id)
        if (!shape) {
            return
        }

        // 从容器移除
        if (this.mainContainer) {
            this.mainContainer.removeChild(shape.graphics)
        }

        // 销毁图形对象
        shape.destroy()

        // 从缓存移除
        this.shapes.delete(id)

        // 从持久化层删除
        if (this.repository.delete) {
            await this.repository.delete(id)
        }
        console.log(`[PixiManager] 删除图形: ${id}`)
    }

    /**
     * 根据数据创建渲染实例（用于恢复持久化数据）
     */
    private renderShape(data: ShapeData): void {
        let shape: ShapeBase

        switch (data.type) {
            case 'rect':
                shape = new RectNode(data)
                break
            case 'circle':
                shape = new CircleNode(data)
                break
            default:
                console.error(`[PixiManager] 不支持的图形类型: ${data.type}`)
                return
        }

        this.shapes.set(data.id, shape)

        if (this.mainContainer) {
            this.mainContainer.addChild(shape.graphics)
        }
    }

    /**
     * 从 repository 加载所有图形并渲染
     */
    async loadShapes(): Promise<void> {
        const allShapes = await this.repository.getAll()
        allShapes.forEach(shapeData => this.renderShape(shapeData))
    }

    /**
     * 更新图形数据到 repository（同步渲染对象的数据到持久化层）
     */
    async updateShapeData(id: string): Promise<void> {
        const shape = this.shapes.get(id)
        if (!shape) {
            console.warn(`[PixiManager] 图形不存在: ${id}`)
            return
        }

        const currentData = shape.getData()
        await this.repository.update(id, currentData)
    }

    /**
     * 屏幕坐标转世界坐标
     */
    screenToWorld(screenX: number, screenY: number): { x: number, y: number } {
        return {
            x: (screenX - this.currentViewport.x) / this.currentViewport.scale,
            y: (screenY - this.currentViewport.y) / this.currentViewport.scale,
        }
    }

    /**
     * 获取指定屏幕坐标位置的图形 ID（从上到下查找）
     */
    getShapeAtPoint(screenX: number, screenY: number): string | null {
        const world = this.screenToWorld(screenX, screenY)
        const shapeArray = Array.from(this.shapes.values()).reverse()

        for (const shape of shapeArray) {
            if (shape.containsPoint(world.x, world.y)) {
                return shape.id
            }
        }

        return null
    }
}

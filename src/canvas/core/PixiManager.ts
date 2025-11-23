/**
 * PixiManager.ts - Pixi WebGL 渲染管理器
 * 职责：管理 Pixi Application、主场景容器、渲染循环、图形对象管理、拾取检测、拖拽
 */

import type { ShapeBase } from '../objects/ShapeBase'
import type { ViewportState } from './Viewport'
import { Application, Container } from 'pixi.js'
import { CircleNode } from '../objects/CircleNode'
import { RectNode } from '../objects/RectNode'

export class PixiManager {
    private app: Application | null = null
    private mainContainer: Container | null = null

    private shapes: Map<string, ShapeBase> = new Map()
    private selectedShapeIds: Set<string> = new Set()
    private nextShapeId = 1

    private draggingShape: ShapeBase | null = null
    private dragOffset = { x: 0, y: 0 }
    private currentViewport: ViewportState = { x: 0, y: 0, scale: 1 }

    // 控制图形交互是否启用
    private interactionEnabled = true

    // 选中变化监听器
    private selectionListeners: Array<(selectedIds: string[]) => void> = []

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
        return this.shapes.get(id) || null
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
     * 启用/禁用所有图形的交互
     */
    setInteractionEnabled(enabled: boolean): void {
        this.interactionEnabled = enabled
        this.shapes.forEach((shape) => {
            shape.graphics.eventMode = enabled ? 'static' : 'none'
            shape.graphics.cursor = enabled ? 'move' : 'default'
        })
        console.log(`[PixiManager] 图形交互 ${enabled ? '启用' : '禁用'}`)
    }

    addRect(x: number, y: number, width: number, height: number, style: { fillColor: number, strokeColor: number, strokeWidth: number }): string {
        const id = `shape_${this.nextShapeId++}`
        const rect = new RectNode({
            id,
            type: 'rect',
            x,
            y,
            width,
            height,
            color: style.fillColor,
            borderColor: style.strokeColor,
            borderWidth: style.strokeWidth,
        })

        this.shapes.set(id, rect)

        if (this.mainContainer) {
            this.mainContainer.addChild(rect.graphics)
        }

        this.setupDragEvents(rect)
        return id
    }

    addCircle(x: number, y: number, radius: number, style: { fillColor: number, strokeColor: number, strokeWidth: number }): string {
        const id = `shape_${this.nextShapeId++}`
        const circle = new CircleNode({
            id,
            type: 'circle',
            x,
            y,
            radius,
            color: style.fillColor,
            borderColor: style.strokeColor,
            borderWidth: style.strokeWidth,
        })

        this.shapes.set(id, circle)

        if (this.mainContainer) {
            this.mainContainer.addChild(circle.graphics)
        }

        this.setupDragEvents(circle)
        return id
    }

    private setupDragEvents(shape: ShapeBase): void {
        const graphics = shape.graphics

        // 根据当前交互状态设置
        graphics.eventMode = this.interactionEnabled ? 'static' : 'none'
        graphics.cursor = this.interactionEnabled ? 'move' : 'default'

        graphics.on('pointerdown', (event) => {
            // 如果交互被禁用,直接返回
            if (!this.interactionEnabled)
                return

            this.selectShape(shape.id)
            this.draggingShape = shape
            const pos = event.global

            const worldX = (pos.x - this.currentViewport.x) / this.currentViewport.scale
            const worldY = (pos.y - this.currentViewport.y) / this.currentViewport.scale
            const shapePos = shape.getPosition()

            this.dragOffset.x = worldX - shapePos.x
            this.dragOffset.y = worldY - shapePos.y

            graphics.cursor = 'grabbing'
            event.stopPropagation()
        })

        graphics.on('pointerup', () => {
            if (!this.interactionEnabled)
                return
            this.draggingShape = null
            graphics.cursor = 'move'
        })

        graphics.on('pointerupoutside', () => {
            if (!this.interactionEnabled)
                return
            this.draggingShape = null
            graphics.cursor = 'move'
        })

        graphics.on('globalpointermove', (event) => {
            if (!this.interactionEnabled)
                return
            if (this.draggingShape === shape) {
                const pos = event.global
                const worldX = (pos.x - this.currentViewport.x) / this.currentViewport.scale
                const worldY = (pos.y - this.currentViewport.y) / this.currentViewport.scale

                shape.setPosition(
                    worldX - this.dragOffset.x,
                    worldY - this.dragOffset.y,
                )

                // 通知选中监听器更新（包括选择框）
                this.notifySelectionChange()
            }
        })
    }

    selectShape(id: string): void {
        this.clearSelection()
        this.selectedShapeIds.add(id)
        const shape = this.shapes.get(id)
        if (shape) {
            shape.setSelected(true)
        }
        this.notifySelectionChange()
        console.log('[PixiManager] 选中图形:', id)
    }

    clearSelection(): void {
        this.selectedShapeIds.forEach((id) => {
            const shape = this.shapes.get(id)
            if (shape) {
                shape.setSelected(false)
            }
        })
        this.selectedShapeIds.clear()
        this.notifySelectionChange()
    }

    /**
     * 订阅选中变化
     */
    onSelectionChange(listener: (selectedIds: string[]) => void): () => void {
        this.selectionListeners.push(listener)
        return () => {
            const index = this.selectionListeners.indexOf(listener)
            if (index > -1) {
                this.selectionListeners.splice(index, 1)
            }
        }
    }

    private notifySelectionChange(): void {
        const ids = Array.from(this.selectedShapeIds)
        this.selectionListeners.forEach(listener => listener(ids))
    }

    hitTest(screenX: number, screenY: number, viewport: ViewportState): string | null {
        const worldX = (screenX - viewport.x) / viewport.scale
        const worldY = (screenY - viewport.y) / viewport.scale

        const shapeArray = Array.from(this.shapes.values()).reverse()

        for (const shape of shapeArray) {
            if (shape.hitTest(worldX, worldY)) {
                return shape.id
            }
        }

        return null
    }
}

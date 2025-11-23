/**
 * RenderOrchestrator.ts - 渲染编排器
 * 职责：统一管理 Pixi / Canvas / DOM 三层渲染，协调 Viewport 同步
 */

import type { ViewportState } from './Viewport'
import { CircleTool, PanTool, RectTool, SelectTool, ToolManager } from '@/canvas-tools'
import { CanvasManager } from './CanvasManager'
import { DOMManager } from './DOMManager'
import { PixiManager } from './PixiManager'
import { Viewport } from './Viewport'

export interface ShapeStyle {
    fillColor: number
    strokeColor: number
    strokeWidth: number
}

export class RenderOrchestrator {
    private pixiManager: PixiManager
    private canvasManager: CanvasManager
    private domManager: DOMManager
    private viewport: Viewport
    private toolManager: ToolManager

    private currentShapeStyle: ShapeStyle = {
        fillColor: 0x3B82F6,
        strokeColor: 0x000000,
        strokeWidth: 1,
    }

    constructor() {
        this.pixiManager = new PixiManager()
        this.canvasManager = new CanvasManager()
        this.domManager = new DOMManager()
        this.viewport = new Viewport()
        this.toolManager = new ToolManager()

        // 注册所有工具
        this.toolManager.register(new SelectTool(this))
        this.toolManager.register(new PanTool(this))
        this.toolManager.register(new RectTool(this))
        this.toolManager.register(new CircleTool(this))

        // 默认激活选择工具
        this.toolManager.setActiveTool('select')

        // 监听 Viewport 变化，同步到三层
        this.viewport.onChange((state) => {
            this.syncViewportToLayers(state)
        })
    }

    /**
     * 初始化三层渲染
     */
    async init(
        pixiCanvas: HTMLCanvasElement,
        canvas2D: HTMLCanvasElement,
        domOverlay: HTMLElement,
        width: number,
        height: number,
    ): Promise<void> {
        // 初始化三层管理器
        await this.pixiManager.init(pixiCanvas, width, height)
        this.canvasManager.init(canvas2D, width, height)
        this.domManager.init(domOverlay)

        // 同步初始状态
        this.syncViewportToLayers(this.viewport.getState())

        console.log('[RenderOrchestrator] 初始化完成')
    }

    /**
     * 处理窗口大小变化
     */
    resize(width: number, height: number): void {
        this.pixiManager.resize(width, height)
        this.canvasManager.resize(width, height)
        // DOM 层不需要特殊 resize 处理（由 CSS 控制）
    }

    /**
     * 同步 Viewport 到三层
     */
    private syncViewportToLayers(state: ViewportState): void {
        this.pixiManager.syncViewport(state)
        this.canvasManager.syncViewport(state)
        this.domManager.syncViewport(state)
    }

    /**
     * 获取 Viewport 实例（供外部控制缩放/平移）
     */
    getViewport(): Viewport {
        return this.viewport
    }

    /**
     * 获取 Pixi 管理器
     */
    getPixiManager(): PixiManager {
        return this.pixiManager
    }

    /**
     * 获取 Canvas 管理器
     */
    getCanvasManager(): CanvasManager {
        return this.canvasManager
    }

    /**
     * 获取 DOM 管理器
     */
    getDOMManager(): DOMManager {
        return this.domManager
    }

    /**
     * 获取工具管理器
     */
    getToolManager(): ToolManager {
        return this.toolManager
    }

    /**
     * 设置当前图形样式
     */
    public setShapeStyle(style: Partial<ShapeStyle>) {
        this.currentShapeStyle = { ...this.currentShapeStyle, ...style }
    }

    /**
     * 获取当前图形样式
     */
    public getShapeStyle(): ShapeStyle {
        return { ...this.currentShapeStyle }
    }

    /**
     * 销毁所有渲染层
     */
    destroy(): void {
        this.pixiManager.destroy()
        this.canvasManager.destroy()
        this.domManager.destroy()
        console.log('[RenderOrchestrator] 已销毁')
    }
}

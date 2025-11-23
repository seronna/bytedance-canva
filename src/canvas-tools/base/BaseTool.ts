/**
 * BaseTool.ts - 工具基类
 * 职责：提供通用的工具基础功能
 */

import type { PixiManager } from '../../canvas/core/PixiManager'
import type { RenderOrchestrator } from '../../canvas/core/RenderOrchestrator'
import type { Viewport } from '../../canvas/core/Viewport'
import type { ITool, PointerEvent, ToolName } from '../../types/tool'

/**
 * 工具基类
 * 所有工具的抽象基类，提供通用属性和方法
 */
export abstract class BaseTool implements ITool {
    abstract readonly name: ToolName

    protected readonly orchestrator: RenderOrchestrator
    protected readonly pixiManager: PixiManager
    protected readonly viewport: Viewport

    constructor(orchestrator: RenderOrchestrator) {
        this.orchestrator = orchestrator
        this.pixiManager = orchestrator.getPixiManager()
        this.viewport = orchestrator.getViewport()
    }

    // 默认实现（子类可覆盖）
    activate(): void {
        // 默认：禁用图形交互
        this.pixiManager.setInteractionEnabled(false)
    }

    deactivate(): void {
        // 默认：清理状态
    }

    onPointerDown(_e: PointerEvent): void {
        // 子类实现
    }

    onPointerMove(_e: PointerEvent): void {
        // 子类实现
    }

    onPointerUp(_e: PointerEvent): void {
        // 子类实现
    }
}

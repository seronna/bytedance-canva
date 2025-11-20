import type { ITool, ToolName } from '../types/tool'

/**
 * 工具管理器
 * 负责注册、切换和调度工具
 */
export class ToolManager {
    private tools = new Map<ToolName, ITool>()
    private currentTool: ITool | null = null

    /**
     * 注册工具
     */
    register(tool: ITool): void {
        this.tools.set(tool.name, tool)
    }

    /**
     * 切换到指定工具
     */
    setActiveTool(name: ToolName): void {
        const tool = this.tools.get(name)
        if (!tool) {
            console.warn(`Tool "${name}" not found`)
            return
        }

        // 停用当前工具
        if (this.currentTool) {
            this.currentTool.deactivate()
        }

        // 激活新工具
        this.currentTool = tool
        this.currentTool.activate()
    }

    /**
     * 获取当前工具
     */
    getCurrentTool(): ITool | null {
        return this.currentTool
    }

    /**
     * 获取当前工具名称
     */
    getCurrentToolName(): ToolName | null {
        return this.currentTool?.name ?? null
    }

    /**
     * 转发指针按下事件到当前工具
     */
    handlePointerDown(e: Parameters<ITool['onPointerDown']>[0]): void {
        this.currentTool?.onPointerDown(e)
    }

    /**
     * 转发指针移动事件到当前工具
     */
    handlePointerMove(e: Parameters<ITool['onPointerMove']>[0]): void {
        this.currentTool?.onPointerMove(e)
    }

    /**
     * 转发指针松开事件到当前工具
     */
    handlePointerUp(e: Parameters<ITool['onPointerUp']>[0]): void {
        this.currentTool?.onPointerUp(e)
    }

    /**
     * 转发键盘按下事件到当前工具
     */
    handleKeyDown(e: KeyboardEvent): void {
        this.currentTool?.onKeyDown?.(e)
    }

    /**
     * 转发键盘松开事件到当前工具
     */
    handleKeyUp(e: KeyboardEvent): void {
        this.currentTool?.onKeyUp?.(e)
    }
}

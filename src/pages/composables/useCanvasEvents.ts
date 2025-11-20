import type { Ref } from 'vue'
import type { RenderOrchestrator } from '../../canvas/core/RenderOrchestrator'
import type { PointerEvent as ToolPointerEvent } from '../../types/tool'

/**
 * 画布事件处理组合函数
 * 职责：将浏览器事件转换为标准化的 PointerEvent，并转发给 ToolManager
 * @param getOrchestrator 获取 RenderOrchestrator 实例的函数
 * @param containerRef 画布容器的引用
 */
export function useCanvasEvents(
    getOrchestrator: () => RenderOrchestrator | null,
    containerRef: Ref<HTMLElement | null>
) {
    /**
     * 统一获取事件上下文和坐标
     * 将浏览器 MouseEvent 转换为工具系统的 PointerEvent
     */
    const createPointerEvent = (e: MouseEvent): ToolPointerEvent | null => {
        const orchestrator = getOrchestrator()
        if (!orchestrator || !containerRef.value) return null

        const rect = containerRef.value.getBoundingClientRect()
        const screenX = e.clientX - rect.left
        const screenY = e.clientY - rect.top
        const viewport = orchestrator.getViewport().getState()
        const worldX = (screenX - viewport.x) / viewport.scale
        const worldY = (screenY - viewport.y) / viewport.scale

        return {
            screenX,
            screenY,
            worldX,
            worldY,
            clientX: e.clientX,
            clientY: e.clientY,
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
            button: e.button
        }
    }

    /**
     * 鼠标按下事件：转发给当前工具
     */
    const handleMouseDown = (e: MouseEvent) => {
        const pointerEvent = createPointerEvent(e)
        if (!pointerEvent) return

        const orchestrator = getOrchestrator()
        if (!orchestrator) return

        // 特殊处理：Shift + 拖拽 = 强制平移
        if (e.shiftKey) {
            const toolManager = orchestrator.getToolManager()
            const currentToolName = toolManager.getCurrentToolName()
            // 临时切换到平移工具
            if (currentToolName !== 'pan') {
                toolManager.setActiveTool('pan')
            }
        }

        orchestrator.getToolManager().handlePointerDown(pointerEvent)
    }

    /**
     * 鼠标移动事件：转发给当前工具
     */
    const handleMouseMove = (e: MouseEvent) => {
        const pointerEvent = createPointerEvent(e)
        if (!pointerEvent) return

        const orchestrator = getOrchestrator()
        if (!orchestrator) return

        orchestrator.getToolManager().handlePointerMove(pointerEvent)
    }

    /**
     * 鼠标松开事件：转发给当前工具
     */
    const handleMouseUp = (e: MouseEvent) => {
        const pointerEvent = createPointerEvent(e)
        if (!pointerEvent) return

        const orchestrator = getOrchestrator()
        if (!orchestrator) return

        orchestrator.getToolManager().handlePointerUp(pointerEvent)
    }

    /**
     * 滚轮缩放
     */
    const handleWheel = (e: WheelEvent) => {
        const orchestrator = getOrchestrator()
        if (!orchestrator || !containerRef.value) return

        e.preventDefault()
        const rect = containerRef.value.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        orchestrator.getViewport().zoom(delta, mouseX, mouseY)
    }

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel
    }
}

/**
 * DOMManager.ts - DOM Overlay 管理器
 * 职责：管理 DOM 层（用于富文本、UI 面板、交互控件等），同步 transform
 */

import type { ViewportState } from './Viewport'

export class DOMManager {
    private container: HTMLElement | null = null

    /**
     * 初始化 DOM 容器
     */
    init(container: HTMLElement): void {
        this.container = container

        // DOM 层必须允许 pointer-events，但根据场景可动态开关
        this.container.style.position = 'absolute'
        this.container.style.top = '0'
        this.container.style.left = '0'
        this.container.style.transformOrigin = '0 0'

        console.log('[DOMManager] 初始化完成')
    }

    /**
     * 同步 viewport 变换（但不缩放 DOM，只平移）
     */
    syncViewport(state: ViewportState): void {
        if (!this.container) return

        // 只平移，不缩放
        this.container.style.transform = `translate(${state.x}px, ${state.y}px)`
    }

    /**
     * 将 world 坐标转换成 screen 坐标（DOM 元素用）
     */
    worldToScreen(worldX: number, worldY: number, state: ViewportState) {
        return {
            x: worldX * state.scale + state.x,
            y: worldY * state.scale + state.y,
        }
    }

    /**
     * 给 DOM 元素设置位置（不缩放）
     */
    setElementPosition(el: HTMLElement, worldX: number, worldY: number, state: ViewportState) {
        const { x, y } = this.worldToScreen(worldX, worldY, state)
        el.style.transform = `translate(${x}px, ${y}px)`
        el.style.transformOrigin = '0 0'
    }

    appendChild(element: HTMLElement): void {
        if (!this.container) return
        this.container.appendChild(element)
    }

    removeChild(element: HTMLElement): void {
        if (!this.container) return
        this.container.removeChild(element)
    }

    clear(): void {
        if (!this.container) return
        this.container.innerHTML = ''
    }

    getContainer(): HTMLElement | null {
        return this.container
    }

    destroy(): void {
        this.clear()
        this.container = null
        console.log('[DOMManager] 已销毁')
    }
}

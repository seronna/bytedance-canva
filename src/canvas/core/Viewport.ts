/**
 * Viewport.ts - 视口管理器
 * 职责：管理画布的缩放（zoom）和平移（pan），并同步到三层渲染
 */

export interface ViewportState {
    x: number // 平移 X
    y: number // 平移 Y
    scale: number // 缩放比例
}

export class Viewport {
    private state: ViewportState = {
        x: 0,
        y: 0,
        scale: 1,
    }

    // 最小/最大缩放限制
    private minScale = 0.1
    private maxScale = 5

    // 监听器列表
    private listeners: Array<(state: ViewportState) => void> = []

    constructor(initialState?: Partial<ViewportState>) {
        if (initialState) {
            this.state = { ...this.state, ...initialState }
        }
    }

    /**
     * 获取当前视口状态
     */
    getState(): ViewportState {
        return { ...this.state }
    }

    /**
     * 平移视口
     * @param dx 水平偏移量
     * @param dy 垂直偏移量
     */
    pan(dx: number, dy: number): void {
        this.state.x += dx
        this.state.y += dy
        this.notifyListeners()
    }

    /**
     * 设置缩放（以某个中心点缩放）
     * @param delta 缩放增量（正数放大，负数缩小）
     * @param centerX 缩放中心点 X（屏幕坐标）
     * @param centerY 缩放中心点 Y（屏幕坐标）
     */
    zoom(delta: number, centerX: number, centerY: number): void {
        const oldScale = this.state.scale
        const newScale = Math.max(
            this.minScale,
            Math.min(this.maxScale, oldScale * (1 + delta)),
        )

        if (newScale === oldScale)
            return

        // 缩放时调整平移，使得 centerX/centerY 保持在屏幕同一位置
        // 公式：newPos = centerPos - (centerPos - oldPos) * (newScale / oldScale)
        this.state.x = centerX - (centerX - this.state.x) * (newScale / oldScale)
        this.state.y = centerY - (centerY - this.state.y) * (newScale / oldScale)
        this.state.scale = newScale

        this.notifyListeners()
    }

    /**
     * 设置缩放（不考虑中心点）
     * @param scale 目标缩放比例
     */
    setScale(scale: number): void {
        this.state.scale = Math.max(this.minScale, Math.min(this.maxScale, scale))
        this.notifyListeners()
    }

    /**
     * 设置平移
     * @param x 目标平移 X
     * @param y 目标平移 Y
     */
    setPosition(x: number, y: number): void {
        this.state.x = x
        this.state.y = y
        this.notifyListeners()
    }

    /**
     * 重置视口到初始状态
     */
    reset(): void {
        this.state = { x: 0, y: 0, scale: 1 }
        this.notifyListeners()
    }

    /**
     * 订阅视口变化
     */
    onChange(listener: (state: ViewportState) => void): () => void {
        this.listeners.push(listener)
        // 返回取消订阅函数
        return () => {
            const index = this.listeners.indexOf(listener)
            if (index > -1) {
                this.listeners.splice(index, 1)
            }
        }
    }

    /**
     * 通知所有监听器
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state))
    }
}

/**
 * 工具类型定义
 * slect：选择工具
 * pan: 平移工具
 * rect：矩形工具
 * circle：圆形工具
 * text：文本工具
 * image：图像工具
 * line：线条工具
 */

export type ToolName = 'select' | 'pan' | 'rect' | 'circle' | 'text' | 'image' | 'line'

/**
 * 指针事件接口
 * 包含屏幕坐标、世界坐标、客户端坐标及修饰键状态
 * @param screenX 屏幕坐标 X
 * @param screenY 屏幕坐标 Y
 * @param worldX 世界坐标 X
 * @param worldY 世界坐标 Y
 * @param clientX 客户端坐标 X
 * @param clientY 客户端坐标 Y
 * @param shiftKey Shift 键状态
 * @param ctrlKey Ctrl 键状态
 * @param altKey Alt 键状态
 * @param metaKey Meta 键状态
 * @param button 按钮编号（0：主按钮，1：中键，2：右键）
 */
export interface PointerEvent {
    screenX: number
    screenY: number
    worldX: number
    worldY: number
    clientX: number
    clientY: number
    shiftKey: boolean
    ctrlKey: boolean
    altKey: boolean
    metaKey: boolean
    button: number
}

/**
 * 工具接口
 * 每个工具实现此接口，由 ToolManager 统一调度
 */
export interface ITool {
    /** 工具名称 */
    readonly name: ToolName

    /** 工具激活时调用 */
    activate: () => void

    /** 工具停用时调用 */
    deactivate: () => void

    /** 鼠标/触摸按下 */
    onPointerDown: (e: PointerEvent) => void

    /** 鼠标/触摸移动 */
    onPointerMove: (e: PointerEvent) => void

    /** 鼠标/触摸松开 */
    onPointerUp: (e: PointerEvent) => void

    /** 键盘按下（可选，用于快捷键） */
    onKeyDown?: (e: KeyboardEvent) => void

    /** 键盘松开（可选） */
    onKeyUp?: (e: KeyboardEvent) => void
}

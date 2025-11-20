import { RenderOrchestrator } from '../../canvas/core/RenderOrchestrator'

/**
 * 画布协调器组合函数
 * 负责初始化和管理 RenderOrchestrator 实例
 */
export function useCanvasOrchestrator() {
    const pixiCanvasRef = ref<HTMLCanvasElement | null>(null)
    const canvas2DRef = ref<HTMLCanvasElement | null>(null)
    const domOverlayRef = ref<HTMLElement | null>(null)
    const containerRef = ref<HTMLElement | null>(null)
    const zoomLevel = ref(100)
    const orchestratorInstance = shallowRef<RenderOrchestrator | null>(null)

    let orchestrator: RenderOrchestrator | null = null

    const handleResize = () => {
        if (!containerRef.value || !orchestrator) return
        const rect = containerRef.value.getBoundingClientRect()
        if (rect.width < 10 || rect.height < 10) return
        orchestrator.resize(rect.width, rect.height)
    }

    let resizeObserver: ResizeObserver | null = null

    onMounted(async () => {
        if (!pixiCanvasRef.value || !canvas2DRef.value || !domOverlayRef.value || !containerRef.value) return

        const rect = containerRef.value.getBoundingClientRect()
        orchestrator = new RenderOrchestrator()
        orchestratorInstance.value = orchestrator
        await orchestrator.init(
            pixiCanvasRef.value,
            canvas2DRef.value,
            domOverlayRef.value,
            rect.width,
            rect.height
        )

        // Initial demo shapes
        // const pixiManager = orchestrator.getPixiManager()
        // pixiManager.addRect(100, 100, 200, 150, 0x3b82f6)
        // pixiManager.addCircle(400, 150, 80, 0xef4444)

        orchestrator.getViewport().onChange((state) => {
            zoomLevel.value = Math.round(state.scale * 100)
        })

        window.addEventListener('resize', handleResize)

        resizeObserver = new ResizeObserver(() => {
            setTimeout(() => nextTick(handleResize), 50)
        })
        resizeObserver.observe(containerRef.value)

        //isReady.value = true
    })

    onUnmounted(() => {
        resizeObserver?.disconnect()
        window.removeEventListener('resize', handleResize)
        orchestrator?.destroy()
    })

    return {
        pixiCanvasRef,
        canvas2DRef,
        domOverlayRef,
        containerRef,
        zoomLevel,
        getOrchestrator: () => orchestrator,
        orchestrator: orchestratorInstance
    }
}

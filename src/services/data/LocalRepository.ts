/**
 * LocalRepository.ts - 本地图形数据仓库实现
 * 职责：基于 localStorage 的数据持久化，实现 IShapeRepository 接口
 */

import type { IShapeRepository } from './IShapeRepository'
import type { ShapeData } from '@/canvas/objects/ShapeBase'
import { nanoid } from 'nanoid'
import { shallowRef } from 'vue'

export class LocalRepository implements IShapeRepository {
    private shapes = shallowRef<Record<string, ShapeData>>({})
    private storageKey = 'canvas-shapes'

    constructor() {
        this.loadFromStorage()
    }

    // ==================== 持久化方法 ====================

    /**
     * 从 localStorage 加载数据
     */
    private loadFromStorage(): void {
        try {
            const data = localStorage.getItem(this.storageKey)
            if (data) {
                const parsed = JSON.parse(data)
                this.shapes.value = parsed
            }
        }
        catch (error) {
            console.error('[LocalRepository] 加载数据失败:', error)
            this.shapes.value = {}
        }
    }

    /**
     * 保存到 localStorage
     */
    private saveToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.shapes.value))
        }
        catch (error) {
            console.error('[LocalRepository] 保存数据失败:', error)
        }
    }

    /**
     * 更新状态并持久化
     */
    private updateAndPersist(newShapes: Record<string, ShapeData>): void {
        this.shapes.value = newShapes
        this.saveToStorage()
    }

    // ==================== IShapeRepository 接口实现 ====================

    async create(data: Omit<ShapeData, 'id'>): Promise<string> {
        const id = this.generateId()
        const shape: ShapeData = { ...data, id } as ShapeData

        this.updateAndPersist({
            ...this.shapes.value,
            [id]: shape,
        })

        return id
    }

    async update(id: string, updates: Partial<ShapeData>): Promise<void> {
        const shape = this.shapes.value[id]
        if (!shape) {
            console.warn(`[LocalRepository] 图形不存在: ${id}`)
            return
        }

        this.updateAndPersist({
            ...this.shapes.value,
            [id]: { ...shape, ...updates },
        })
    }

    async getAll(): Promise<ShapeData[]> {
        return Object.values(this.shapes.value)
    }

    async delete(id: string): Promise<void> {
        const { [id]: _, ...rest } = this.shapes.value
        this.updateAndPersist(rest)
    }

    /**
     * 生成新的图形 ID
     */
    private generateId(): string {
        return nanoid()
    }
}

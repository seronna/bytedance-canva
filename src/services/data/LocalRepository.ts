/**
 * LocalRepository.ts - 本地图形数据仓库实现
 * 职责：基于 localStorage 的数据持久化，实现 IShapeRepository 接口
 */

import type { IShapeRepository } from './IShapeRepository'
import type { ShapeData } from '@/canvas/objects/ShapeBase'
import { nanoid } from 'nanoid'
import { shallowRef } from 'vue'

type SubscribeCallback = (shapes: ShapeData[]) => void

export class LocalRepository implements IShapeRepository {
    private shapes = shallowRef<Record<string, ShapeData>>({})
    private subscribers = new Set<SubscribeCallback>()
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
     * 通知所有订阅者
     */
    private notifySubscribers(): void {
        const shapesArray = Object.values(this.shapes.value)
        this.subscribers.forEach(callback => callback(shapesArray))
    }

    /**
     * 更新状态并持久化
     */
    private updateAndPersist(newShapes: Record<string, ShapeData>): void {
        this.shapes.value = newShapes
        this.saveToStorage()
        this.notifySubscribers()
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

    /**
     * 使用指定 ID 创建图形（用于已有 ID 的图形）
     */
    async createWithId(shape: ShapeData): Promise<void> {
        this.updateAndPersist({
            ...this.shapes.value,
            [shape.id]: shape,
        })
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

    async delete(id: string): Promise<void> {
        const { [id]: _, ...rest } = this.shapes.value
        this.updateAndPersist(rest)
    }

    async deleteMany(ids: string[]): Promise<void> {
        const idsSet = new Set(ids)
        const filtered = Object.fromEntries(
            Object.entries(this.shapes.value).filter(([id]) => !idsSet.has(id)),
        )
        this.updateAndPersist(filtered)
    }

    async get(id: string): Promise<ShapeData | null> {
        return this.shapes.value[id] || null
    }

    async getAll(): Promise<ShapeData[]> {
        return Object.values(this.shapes.value)
    }

    async queryByIds(ids: string[]): Promise<ShapeData[]> {
        return ids
            .map(id => this.shapes.value[id])
            .filter((shape): shape is ShapeData => Boolean(shape))
    }

    subscribe(callback: SubscribeCallback): () => void {
        this.subscribers.add(callback)

        // 立即触发一次回调
        callback(Object.values(this.shapes.value))

        // 返回取消订阅函数
        return () => {
            this.subscribers.delete(callback)
        }
    }

    async clear(): Promise<void> {
        this.updateAndPersist({})
    }

    // ==================== 访问器（供 Store 使用）====================

    /**
     * 获取响应式的 shapes 对象
     */
    getShapesRef() {
        return this.shapes
    }

    /**
     * 生成新的图形 ID
     */
    generateId(): string {
        return nanoid()
    }
}

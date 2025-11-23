/**
 * IShapeRepository.ts - 图形数据访问层接口
 * 职责：定义数据访问的统一接口，支持未来替换为 CRDT/EventStore
 */

import type { ShapeData } from '@/canvas/objects/ShapeBase'

/**
 * 图形数据仓库接口
 *
 * 当前实现：LocalRepository（基于 Pinia + localStorage）
 * 未来扩展：CRDTRepository（基于 Yjs + WebSocket + EventStore）
 */
export interface IShapeRepository {
    /**
     * 创建新图形
     * @param data 图形数据（不含 ID）
     * @returns 生成的图形 ID
     */
    create: (data: Omit<ShapeData, 'id'>) => Promise<string>

    /**
     * 更新图形
     * @param id 图形 ID
     * @param updates 部分更新数据
     */
    update: (id: string, updates: Partial<ShapeData>) => Promise<void>

    /**
     * 删除图形
     * @param id 图形 ID
     */
    delete: (id: string) => Promise<void>

    /**
     * 批量删除图形
     * @param ids 图形 ID 列表
     */
    deleteMany: (ids: string[]) => Promise<void>

    /**
     * 获取单个图形
     * @param id 图形 ID
     */
    get: (id: string) => Promise<ShapeData | null>

    /**
     * 获取所有图形
     */
    getAll: () => Promise<ShapeData[]>

    /**
     * 批量查询图形
     * @param ids 图形 ID 列表
     */
    queryByIds: (ids: string[]) => Promise<ShapeData[]>

    /**
     * 订阅数据变化
     * @param callback 数据变化回调函数
     * @returns 取消订阅的函数
     */
    subscribe: (callback: (shapes: ShapeData[]) => void) => () => void

    /**
     * 清空所有图形
     */
    clear: () => Promise<void>
}

/**
 * 事件存储接口（预留）
 *
 * 未来用于实现 Event Sourcing + Undo/Redo
 */
export interface IEventStore {
    /**
     * 追加操作到事件流
     */
    append: (operation: Operation) => Promise<void>

    /**
     * 获取指定范围的操作
     */
    getOperations: (from: number, to: number) => Promise<Operation[]>

    /**
     * 重放操作（用于 Undo/Redo）
     */
    replay: (operations: Operation[]) => Promise<void>
}

/**
 * 操作类型定义（预留）
 */
export interface Operation {
    id: string
    type: 'create' | 'update' | 'delete' | 'transform'
    timestamp: number
    userId: string
    shapeId: string
    data: any
    crdtPatch?: Uint8Array // Yjs 的二进制更新数据
}

/**
 * 快照管理接口（预留）
 *
 */
export interface ISnapshotManager {
    /**
     * 创建快照
     */
    createSnapshot: () => Promise<Snapshot>

    /**
     * 加载快照
     */
    loadSnapshot: (id: string) => Promise<void>

    /**
     * 列出所有快照
     */
    listSnapshots: () => Promise<Snapshot[]>

    /**
     * 删除旧快照
     */
    pruneSnapshots: (keepCount: number) => Promise<void>
}

/**
 * 快照数据结构（预留）
 */
export interface Snapshot {
    id: string
    timestamp: number
    operationCount: number // 该快照之前的操作总数
    data: Uint8Array // CRDT 文档的二进制快照
    metadata: {
        shapeCount: number
        version: string
    }
}

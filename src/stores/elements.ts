import { defineStore } from 'pinia'
import type { Element } from '@/cores/types/element'
import { LocalStorage } from './persistence/LocalStorage'

const storage = new LocalStorage('elements_')  // 自定义前缀
const STORAGE_KEY = 'list'

export const useElementsStore = defineStore('elements', {
  state: () => ({
    elements: [] as Element[],
  }),

  getters: {
    getElementById: (state) => (id: string) =>
      state.elements.find((el) => el.id === id),
  },

  actions: {
    /** 初始化：从 LocalStorage 读取 */
    loadFromLocal() {
      this.elements = storage.get<Element[]>(STORAGE_KEY, [])
    },

    /** 保存到 LocalStorage */
    saveToLocal() {
      storage.set(STORAGE_KEY, this.elements)
    },

    /** 添加元素 */
    addElement(payload: Omit<Element, 'id'>) {
      // 兼容环境没有 crypto.randomUUID 的场景
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.floor(Math.random() * 100000)}`
      const newElement: Element = { id, ...payload }

      this.elements.push(newElement)
      this.saveToLocal()
      return id
    },

    /** 更新元素内容 */
    updateElement(id: string, patch: Partial<Element>) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index === -1) return

      this.elements[index] = { ...this.elements[index], ...patch }
      this.saveToLocal()
    },

    /** 移动元素（相对移动） */
    moveElement(id: string, dx: number, dy: number) {
      const el = this.elements.find((e) => e.id === id)
      if (!el) return

      el.x += dx
      el.y += dy
      this.saveToLocal()
    },

    /** 删除元素 */
    removeElement(id: string) {
      this.elements = this.elements.filter((el) => el.id !== id)
      this.saveToLocal()
    },

    /** 清空所有元素 */
    clear() {
      this.elements = []
      this.saveToLocal()
    },
  },
})

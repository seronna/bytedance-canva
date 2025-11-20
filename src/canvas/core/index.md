# RenderOrchestrator.ts - "总指挥"
比喻：画画工作室的"总监"

## 做什么：

统一管理所有员工（Pixi、Canvas2D、DOM、视口、工具）
初始化时把所有"部门"搭建好
当画布需要平移/缩放时，通知所有层一起动
当你切换工具（选择/绘制）时，它来协调

## 白话理解：
你（用户）
  ↓ 告诉总监："我要画矩形"
RenderOrchestrator（总监）
  ↓ 通知 PixiManager："准备好画笔"
  ↓ 通知 ToolManager："切换到矩形工具"

## 什么时候用到它：
每次在 Vue 组件里操作画布，都是通过它：
const orchestrator = getOrchestrator()
orchestrator.getToolManager().setActiveTool('rect') // 切换工具


# PixiManager.ts - "主画师"
## 做什么：
在画布上画出实际的矩形、圆形（用 Pixi.js 这个图形库）
管理所有图形对象（创建、删除、移动、选中）
处理鼠标点击判断"点到哪个图形了"（命中测试）
支持拖拽图形

## 白话理解：
你点击"画矩形"
  ↓
PixiManager 收到指令
  ↓
创建一个 RectNode（矩形对象）
  ↓
把它画到 WebGL 画布上（超快、超清晰）
  ↓
记住这个矩形的 ID："shape-1"


# CanvasManager.ts - "辅助线绘制员"
比喻：用彩笔画"临时标记"的助手

## 做什么：

画一些"临时的、用完就擦掉"的东西
比如：框选时的虚线框、对齐参考线、悬停高亮
不参与实际图形管理，只负责视觉提示

## 白话理解：
你拖拽鼠标框选多个图形
  ↓
CanvasManager 实时画一个半透明的蓝色选择框
  ↓
松开鼠标后，立刻擦掉这个框
  ↓
PixiManager 接手，真正选中图形

## 为什么不用 PixiManager 画这些：

这些东西一秒钟更新几十次（跟随鼠标移动）
用 Canvas2D 直接画更快，擦掉也简单（clearRect）
不需要管理对象生命周期
目前用到了吗：
代码里有 drawSelectionRect 方法，但还没真正用起来（预留接口）。




# DOMManager.ts - "UI 控件管理员"
比喻：管理"浮在画布上的按钮、输入框"的人

## 做什么：

在画布上方叠一层 HTML 元素
比如：选择框的边框 + 四个角的控制点（已经实现了！）
未来：文本编辑器（双击文本时弹出输入框）、右键菜单
## 白话理解：
你选中一个矩形
  ↓
DOMManager 在矩形周围添加一个 <div> 边框
  ↓
边框跟随矩形移动（实时更新 CSS position）
  ↓
四个角有控制点（可以拖拽调整大小）



# Viewport.ts - "摄像师"
比喻：控制"你看到画布哪部分"的摄像师

做什么：

管理画布的平移（pan）和缩放（zoom）
记住当前视角：{ x: 偏移量, y: 偏移量, scale: 缩放倍数 }
当你滚轮缩放或拖拽移动时，它计算新的坐标
## 白话理解：
初始状态：
  x: 0, y: 0, scale: 1（正常大小，左上角对齐）

你按住 Shift 拖拽画布往右移动 100px
  ↓
Viewport 更新：x: 100, y: 0, scale: 1
  ↓
通知所有层："摄像机移动了，你们也跟着动"
  ↓
Pixi/Canvas2D/DOM 同步平移

## 坐标转换：
屏幕坐标：你的鼠标在浏览器窗口的位置（400px, 300px）
世界坐标：图形在"虚拟画布"上的真实位置（200, 150）
Viewport 负责这两者的换算公式：
worldX = (screenX - viewport.x) / viewport.scale



# 它们如何协作？一个完整例子
场景：你画一个矩形，然后缩放画布
1️⃣ 初始化（页面加载时）
   RenderOrchestrator 创建所有部门
   → PixiManager 准备 WebGL 画布
   → CanvasManager 准备 2D 画布
   → DOMManager 准备 HTML 覆盖层
   → Viewport 初始状态 (0, 0, 1)

2️⃣ 画矩形
   你点击工具栏"矩形"
   → RenderOrchestrator.toolManager.setActiveTool('rect')
   → 拖拽鼠标
   → RectTool 计算世界坐标
   → PixiManager.addRect(x, y, w, h) 创建矩形
   → 矩形显示在屏幕上 ✅

3️⃣ 选中矩形
   你点击工具栏"选择"
   → 点击矩形
   → PixiManager.hitTest() 判断点击到了 shape-1
   → PixiManager.selectShape('shape-1')

4️⃣ 缩放画布
   你滚轮向上
   → Viewport.zoom(+0.1)
   → 新状态：scale = 1.1
   → RenderOrchestrator.syncViewportToLayers()
   → PixiManager 收到通知，调整渲染
   → CanvasManager 收到通知（虽然还没用）
   → DOMManager 收到通知，选择框自动放大
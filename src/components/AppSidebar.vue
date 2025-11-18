<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  BookOpen,
  Bot,
  Command,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-vue-next"
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "offcanvas",
})

// This is sample data.
const data = {
  user: {
    name: "designer",
    email: "designer@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "个人创作者",
      logo: Command,
      plan: "免费版",
    },
  ],
  navMain: [
    {
      title: "我的设计",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "最近打开",
          url: "#",
        },
        {
          title: "收藏设计",
          url: "#",
        },
        {
          title: "草稿箱",
          url: "#",
        },
      ],
    },
    {
      title: "设计模板",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "社交媒体",
          url: "#",
        },
        {
          title: "海报传单",
          url: "#",
        },
        {
          title: "PPT模板",
          url: "#",
        },
        {
          title: "电商设计",
          url: "#",
        },
      ],
    },
    {
      title: "素材库",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "图片",
          url: "#",
        },
        {
          title: "图标",
          url: "#",
        },
        {
          title: "字体",
          url: "#",
        },
        {
          title: "音频",
          url: "#",
        },
      ],
    },
    {
      title: "设置",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "个人信息",
          url: "#",
        },
        {
          title: "团队管理",
          url: "#",
        },
        {
          title: "账单设置",
          url: "#",
        },
        {
          title: "偏好设置",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "社交媒体海报",
      url: "#",
      icon: Frame,
    },
    {
      name: "产品宣传单",
      url: "#",
      icon: PieChart,
    },
    {
      name: "旅行攻略设计",
      url: "#",
      icon: Map,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

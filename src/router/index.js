import { createRouter, createWebHashHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/chats',
      name: 'chats',
      component: () => import('@/views/ChatsView.vue'),
    },
    {
      path: '/chats/:id',
      name: 'chat-detail',
      component: () => import('@/views/ChatWindow.vue'),
      props: true,
    },
    {
      path: '/agents',
      name: 'agents',
      component: () => import('@/views/AgentsView.vue'),
    },
    {
      path: '/agents/:id',
      name: 'agent-detail',
      component: () => import('@/views/AgentDetailView.vue'),
      props: true,
    },
    {
      path: '/knowledge',
      name: 'knowledge-list',
      component: () => import('@/views/KnowledgeView.vue'),
    },
    {
      path: '/knowledge/:id',
      name: 'knowledge-detail',
      component: () => import('@/views/KnowledgeGroupDetailView.vue'),
      props: true,
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/views/AccountView.vue'),
    },
    // Catch‑all route for unknown hashes, displays a simple 404 page
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
});

export default router;

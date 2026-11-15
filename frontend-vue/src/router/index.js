import { createRouter, createWebHistory } from 'vue-router';
import WorksListView from '../views/WorksListView.vue';
import WorkDetailView from '../views/WorkDetailView.vue';
import WorkFormView from '../views/WorkFormView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/',
    alias: '/works',
    name: 'works',
    component: WorksListView
  },
  {
    path: '/works/new',
    name: 'work-create',
    component: WorkFormView,
    meta: { requiresAuth: true }
  },
  {
    path: '/works/:id',
    name: 'work-detail',
    component: WorkDetailView
  },
  {
    path: '/works/:id/edit',
    name: 'work-edit',
    component: WorkFormView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');

  // Si ya tiene sesión e intenta entrar al login, redirigir al catálogo
  if (to.name === 'login' && token) {
    return next({ name: 'works' });
  }

  // Rutas privadas con meta.requiresAuth requieren token
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' });
  }

  next();
});

export default router;

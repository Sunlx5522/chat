import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/index",
    name: "index",
    component: () => import("../views/Index.vue"),
    redirect: '/chat',
    children: [
      { path: '/chat', name: 'chat', component: () => import("../views/Chat.vue") },
      { path: '/friend', name: 'friend', component: () => import("../views/Friend.vue") },
      { path: '/file', name: 'file', component: () => import("../views/File.vue") },
    ]
  },
  // {
  //   path: "/about",
  //   name: "about",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   // component: () => import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
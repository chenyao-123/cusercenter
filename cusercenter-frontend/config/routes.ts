export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', layout: false, name: '登录', component: './user/login' },
      { path: '/user/register', layout: false, name: '注册', component: './user/register' },
      { path: '/user', redirect: '/user/login' },
      {
        name: '注册结果',
        icon: 'smile',
        path: '/user/register-result',
        component: './user/register-result',
      },
      { name: '注册', icon: 'smile', path: '/user/register', component: './user/register' },
      { component: '404', path: '/user/*' },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎页',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin/userManager',
    name: '用户管理',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin/userManager',
  },
  {
    name: '个人页',
    icon: 'user',
    path: '/account',
    routes: [
      { path: '/account', redirect: '/account/settings' },
      {
        name: '个人信息',
        icon: 'smile',
        path: '/account/settings',
        component: './account/settings',
      },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { component: '404', path: '/*' },
];

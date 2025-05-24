export default [
  {
    path: '/concord',
    name: 'Concordancer',
    icon: 'smile',
    // hideInMenu: true,
    component: './concordancer',
  },
  {
    path: '/concord/:word',
    name: 'Concordancer',
    icon: 'smile',
    // hideInMenu: true,
    component: './concordancer',
  },
  {
    path: '/',
    redirect: '/concord',
  },
  {
    component: './404',
  },
];

//@ts-nocheck
import { request } from 'umi';

// 用户接口

export async function login(body, options) {
  return request('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: { username: body.username, password: body.password },
    ...(options || {}),
  });
}

// 获取当前的用户信息

export async function info(options) {
  return request('/api/info', {
    method: 'GET',
    headers: {
      Authorization: localStorage.getItem('Authorization'),
    },
    ...(options || {}),
  });
}

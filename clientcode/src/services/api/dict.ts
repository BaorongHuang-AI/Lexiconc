//@ts-nocheck
import { request } from 'umi';

// 获取字典列表
export async function getDictList(body) {
  return request('http://182.43.48.211:15001/dict/list', {
    method: 'POST',
    data: body,
  });
}

//@ts-nocheck
import { request } from 'umi';

// 上传文件解析句子
export async function uploadAndParser(file, language) {
  const formdata = new FormData();
  formdata.append('file', file);
  formdata.append('language', language);
  return request('http://182.43.48.211:15001/web/file/uploadAndParser', {
    method: 'POST',
    data: formdata,
  });
}

export async function exportTmx(data) {
  return request('http://182.43.48.211:15001/web/file/exportTmx', {
    method: 'POST',
    data: data,
  });
}

//@ts-nocheck
import { request } from 'umi';

export async function listSentence(data) {
  return request('http://182.43.48.211:15001/sentence/list', {
    method: 'GET',
  });
}

export async function pageSentence(data) {
  return request('http://182.43.48.211:15001/sentence/page', {
    method: 'POST',
    data,
  });
}

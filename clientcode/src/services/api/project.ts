//@ts-nocheck
import { request } from 'umi';

export async function listProject() {
  return request('http://182.43.48.211:15001/project/list', {
    method: 'GET',
  });
}

export async function saveProject(data) {
  return request('http://182.43.48.211:15001/project/save', {
    method: 'POST',
    data,
  });
}

export async function getProject(id) {
  return request('http://182.43.48.211:15001/project/get/{id}', {
    method: 'GET',
  });
}

export async function updateProject(data) {
  return request('http://182.43.48.211:15001/project/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteProject(id) {
  return request('http://182.43.48.211:15001/project/delete', {
    method: 'DELETE',
    params: {
      id: id,
    },
  });
}

export async function updateProjectAndSaveSentences(data) {
  return request('http://localhost:15001/api/v1/project/updateProjectAndSaveSentences', {
    method: 'POST',
    data,
  });
}

export async function getProjectWithSentencesByPid(pid) {
  return request('http://182.43.48.211:15001/project/getProjectWithSentencesByPid', {
    method: 'GET',
    params: {
      pid: pid,
    },
  });
}

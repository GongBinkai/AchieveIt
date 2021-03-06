import axios from 'axios';
import { ResultCommon } from 'achieve-it-contract';

const baseURL = 'http://localhost:3000';

function sendErrorMsg(type: string, url: string, payload?: { body?: {}; response?: {} }) {
  const title = `${type} ${url} failed`;
  let body = '';
  let response = '';
  if (payload) {
    if (payload.body) body = `body: ${JSON.stringify(payload.body)}`;
    if (payload.response) response = `response: ${JSON.stringify(payload.response)}`;
  }
  throw new Error(JSON.stringify({ title, body, response }));
}

export async function axiosPost<Response extends ResultCommon>(namespace: string, endpoint: string, body?: object) {
  const url = `${baseURL}/${namespace}/${endpoint}`;
  const result = await axios.post<Response>(url, body);
  if (result.data.status === 'error') {
    sendErrorMsg('POST', url, { body, response: result.data });
    throw new Error('error code');
  }
  return result.data;
}

export async function axiosGet<Response extends ResultCommon>(namespace: string, endpoint: string, body?: object) {
  const url = `${baseURL}/${namespace}/${endpoint}`;
  const result = await axios.get<Response>(url, body);
  if (result.data.status === 'error') {
    sendErrorMsg('GET', url, { response: result.data });
    throw new Error('error code');
  }
  return result.data;
}

export async function axiosDelete<Response extends ResultCommon>(namespace: string, endpoint: string, body?: object) {
  const url = `${baseURL}/${namespace}/${endpoint}`;
  const result = await axios.delete<Response>(url, body);
  if (result.data.status === 'error') {
    sendErrorMsg('DELETE', url, { response: result.data });
    throw new Error('error code');
  }
  return result.data;
}

export async function axiosPut<Response extends ResultCommon>(namespace: string, endpoint: string, body?: object) {
  const url = `${baseURL}/${namespace}/${endpoint}`;
  const result = await axios.put<Response>(url, body);
  if (result.data.status === 'error') {
    sendErrorMsg('PUT', url, { body, response: result.data });
    throw new Error('error code');
  }
  return result.data;
}

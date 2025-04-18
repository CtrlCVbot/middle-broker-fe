import apiClient from '../api-client';
import { IAddressItem, IAddressParams, IAddressBatchAction } from '@/types/address';

/**
 * 주소 목록을 조회하는 함수
 */
export const getAddresses = async (params?: IAddressParams) => {
  const response = await apiClient.get('/addresses', { params });
  return response;
};

/**
 * 특정 ID의 주소 상세 정보를 조회하는 함수
 */
export const getAddressById = async (id: string) => {
  const response = await apiClient.get(`/addresses/${id}`);
  return response;
};

/**
 * 새 주소를 등록하는 함수
 */
export const createAddress = async (addressData: Partial<IAddressItem>) => {
  const response = await apiClient.post('/addresses', addressData);
  return response;
};

/**
 * 기존 주소를 수정하는 함수
 */
export const updateAddress = async (id: string, addressData: Partial<IAddressItem>) => {
  const response = await apiClient.put(`/addresses/${id}`, addressData);
  return response;
};

/**
 * 주소를 삭제하는 함수
 */
export const deleteAddress = async (id: string) => {
  const response = await apiClient.delete(`/addresses/${id}`);
  return response;
};

/**
 * 여러 주소에 대한 일괄 작업을 수행하는 함수
 */
export const batchAddressAction = async (actionData: IAddressBatchAction) => {
  const response = await apiClient.post('/addresses/batch', actionData);
  return response;
};

/**
 * 주소를 즐겨찾기에 추가/제거하는 함수
 */
export const toggleAddressFavorite = async (id: string, isFavorite: boolean) => {
  const response = await apiClient.put(`/addresses/${id}`, { is_favorite: isFavorite });
  return response;
};

/**
 * 주소 검색 함수
 */
export const searchAddresses = async (query: string, type?: string) => {
  const params = {
    search: query,
    ...(type ? { type } : {})
  };
  const response = await apiClient.get('/addresses', { params });
  return response;
}; 
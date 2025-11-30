import axiosInstance from './axiosConfig';

export const userApi = {
  getProfile: async (userId) => {
    const { data } = await axiosInstance.get(`/admin/users/${userId}/profile`);
    return data;
  },
};


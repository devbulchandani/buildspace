import axiosClient from './axiosClient';

export const verificationApi = {
    verifyMilestone: async (milestoneId) => {
        const response = await axiosClient.post(`/verify/${milestoneId}`);
        return response.data;
    }
};

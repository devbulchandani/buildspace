import axiosClient from './axiosClient';

export const chatApi = {
    sendMessage: async (learningPlanId, message) => {
        const response = await axiosClient.post('/chat', {
            learningPlanId,
            message,
        });
        return response.data;
    }
};

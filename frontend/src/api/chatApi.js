import axiosClient from './axiosClient';

export const chatApi = {
    sendMessage: async (learningPlanId, message, repoUrl) => {
        const response = await axiosClient.post('/chat', {
            learningPlanId,
            message,
            repoUrl
        });
        return response.data;
    }
};

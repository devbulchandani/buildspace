import axiosClient from './axiosClient';

export const planApi = {
    createPlan: async (technology, duration, skillLevel) => {
        const response = await axiosClient.post('/plans', {
            technology,
            duration,
            skillLevel
        });
        return response.data;
    },

    getMyPlans: async () => {
        const response = await axiosClient.get("/plans/my-plans");
        return response.data;
    },

    updateGitubUrl: async (planId, githubUrl) => {
        const response = await axiosClient.put(`/plans/${planId}/github`, null, {
            params: { githubUrl }
        });
        return response.data;
    }
};

import { userModel } from "../models/user";

export const authService = {
    login: async (email: string, password: string) => {
        const user = await userModel.findByEmail(email);
    },
};
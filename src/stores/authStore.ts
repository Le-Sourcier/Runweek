import {create} from 'zustand';
import {User} from "../types/user.tsx";

const accessTokenName = "aspk"; // Access token
const refreshTokenName = "rft"; // Refresh token

const defaultImage = "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop";

interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	setUser: (user?: User | null) => void;
	setAccessToken: (token?: string | null) => void;
	setRefreshToken: (token?: string | null) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: localStorage.getItem(accessTokenName) || null,
	refreshToken: localStorage.getItem(refreshTokenName) || null,
	user: null,

	setAccessToken: (token) => {
		set({accessToken: token});
		if (token) {
			localStorage.setItem(accessTokenName, token || "");
		} else {
			localStorage.removeItem(accessTokenName);
		}
	},

	setRefreshToken: (token) => {
		set({refreshToken: token});
		if (token) {
			localStorage.setItem(refreshTokenName, token || "");
		} else {
			localStorage.removeItem(refreshTokenName);
		}
	},

	setUser: (user?: User|null) => {
		set({user: {...user, image: user?.image || defaultImage} as User});
	},

	logout: () => set({accessToken: null, refreshToken: null, user: null}),
}));
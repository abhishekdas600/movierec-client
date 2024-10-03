import axiosInstance from "@/config/config";
import { useQuery } from "@tanstack/react-query";
import { Favourites, Watchlist } from "./watchlist";

export interface User {
    ID: number;
    name: string;
    email: string;
    watchlist: Watchlist[];
    favourites: Favourites[];
}


export const useCurrentUser = () => {
    const query = useQuery<User>({
        queryKey: ["current-user"],
        queryFn: async () => {
            const response = await axiosInstance.get("/user");
            console.log("User data received:", response.data);
            return response.data;
        },
        staleTime: 1000,
        retry: false,
    });

    return {
        ...query,
        user: query.isSuccess ? query.data : null,
        
    };
};


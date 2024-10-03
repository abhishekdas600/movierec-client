import axiosInstance from "@/config/config"
import { useQuery } from "@tanstack/react-query"


export interface Watchlist{
    id: number,
    user_id: number,
    tmdb_id: number
}
export interface Favourites{
    id: number,
    user_id: number,
    tmdb_id: number
}


export const useGetWatchlist = ()=>{
    const query = useQuery<Watchlist[]>({
        queryKey:['watchlist'],
        queryFn: async()=>{
           const response = await axiosInstance.get("/watchlist");
           return response.data
        },
        staleTime: 1000,
        retry: false,
    })
    return {
        ...query,
        data: query.isSuccess ? query.data : null, 
    };
}

export const useGetFavourites = ()=>{
    const query = useQuery<Favourites[]>({
        queryKey:['favourites'],
        queryFn: async()=>{
            const response = await axiosInstance.get('/favourites');
            return response.data
        },
        staleTime: 1000,
        retry: false,
    })
    return {
        ...query,
        data: query.isSuccess ? query.data : null, 
    };
}
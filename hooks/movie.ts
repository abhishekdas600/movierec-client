import axiosInstance from "@/config/config"
import { useQuery } from "@tanstack/react-query"




export interface Genres{
    id : number,
    name: string
}

export interface GenreListResponse{
    genres: Genres[]
}

interface CastMember {
  id: number;
  name: string;
  character: string;
}


export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  genres: Genres[];  
  release_date: string; 
  status: string;  
  vote_average: number;  
  credits: {
    cast: CastMember[];  
  };
}

  
  export interface MovieListResponse {
    results: Movie[];
    page: number;
    total_pages: number;
  }
  

export const useGetGenres = () => {
    const query = useQuery<GenreListResponse>({
        queryKey: ["genres"],
        queryFn: async () => {
            const response = await axiosInstance.get("/genres");
            return response.data; 
        },
        staleTime: 1000,
        retry: false,
    });

    return {
        ...query,
        genres: query.isSuccess ? query.data.genres : null, 
    };
};


const fetchMovies = async (filter: string, genres: number[], currentPage: number): Promise<MovieListResponse> => { 
  const genreIds = genres.join(","); 
  const { data } = await axiosInstance.get<MovieListResponse>("/movie/filter", {
    params: {
      filter: filter.toLowerCase(),
      genres: genreIds,
      page: currentPage
    },
  });
  return data;
};

export function useMoviesQuery(selectedFilter: string, selectedGenres: number[], currentPage: number) {
  return useQuery<MovieListResponse, Error>({
    queryKey: ['movies', selectedFilter, selectedGenres, currentPage], 
    queryFn: () => fetchMovies(selectedFilter, selectedGenres, currentPage),
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
}

export const fetchSearchMovies = async (searchQuery: string, page: number): Promise<MovieListResponse> => {
  const { data } = await axiosInstance.get<MovieListResponse>("/search", {
    params: {
      query: searchQuery,
      page: page,
    },
  });
  return data;
};

export const useSearchMovies = (searchQuery: string, page: number) => {
  return useQuery({
    queryKey: ['search-movies', searchQuery, page],
    queryFn: () => fetchSearchMovies(searchQuery, page),
    enabled: !!searchQuery.trim(),
    
  });
};

export const useGetMoviesById = (tmdb_id: string)=>{
  const query = useQuery<Movie>({
    queryKey:['moviesbyid',tmdb_id],
    queryFn: async()=>{
      const response = await axiosInstance.get(`/movies/${tmdb_id}`)
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


const fetchRecommendations = async (): Promise<Movie[]> => {
  const response = await axiosInstance.get<{ recommendations: Movie[] | null }>("/recommendations");
  return response.data.recommendations || []; 
};

export const useGetRecommendations = () => {
  return useQuery<Movie[], Error>({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false, 
  });
};
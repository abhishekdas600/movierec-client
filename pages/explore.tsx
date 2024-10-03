import React, { useEffect, useState } from "react";
import axiosInstance from "@/config/config";
import { Genres, Movie, useGetGenres } from "@/hooks/movie"; 
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks/user"; 
import { useGetRecommendations } from "@/hooks/movie"; 
import MovieCard from "@/components/moviecard"; 
import { useQueryClient } from "@tanstack/react-query";


const getRandomGenres = (genres: Genres[], count: number) => {
  const shuffled = genres.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled;
};

const ExplorePage: React.FC = () => {
  const [randomGenres, setRandomGenres] = useState<Genres[]>([]);
  const { data: genres, isLoading: genresLoading } = useGetGenres();
  const [moviesByGenre, setMoviesByGenre] = useState<{ [key: string]: Movie[] }>({});
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser(); // Use your hook to get the current user
  const { data: recommendedMovies, isLoading: isLoadingRecommendations, error: recError } = useGetRecommendations(); // Use correct hook to fetch recommendations
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    
    if (genres && genres.genres.length > 0) {
      const selectedGenres = getRandomGenres(genres.genres, 5);
      setRandomGenres(selectedGenres);

      const fetchMoviesForGenres = async () => {
        try {
          const promises = selectedGenres.map((genre) =>
            axiosInstance.get(`/moviesbygenre/${genre.id}?limit=8`)
          );
          const responses = await Promise.all(promises);
          const movies = responses.reduce((acc, response, idx) => {
            acc[selectedGenres[idx].name] = response.data;
            return acc;
          }, {} as { [key: string]: Movie[] });
          setMoviesByGenre(movies);
        } catch (error) {
          console.error("Error fetching movies for genres:", error);
          setError("Failed to fetch movies. Please try again.");
        }
      };

      fetchMoviesForGenres();
    }
  }, [genres]);

 
  const handleLogin = () => {
    if (user) {
      console.error("User already exists");
      return;
    }
    window.location.href = `${axiosInstance.defaults.baseURL}/auth/google`;
  };

  
  const handleLogout = async () => {
    try {
      await axiosInstance.get("/auth/logout");
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  
  const handleHome = () => {
    router.push("/");
  };

  if (genresLoading) {
    return <p>Loading genres...</p>;
  }

  if (error || recError) {
    const displayError =
      typeof error === "object" && error !== null && "message" in error
        ? (error as Error).message
        : typeof error === "string"
        ? error
        : typeof recError === "object" && recError !== null && "message" in recError
        ? (recError as Error).message
        : typeof recError === "string"
        ? recError
        : "An unknown error occurred";

    return <p className="text-red-500">{displayError}</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between max-w-6xl">
          <button className="text-white text-xl font-bold" onClick={handleHome}>
            MovieRec
          </button>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="text-white px-4 py-2">{user.name}</button>
                <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded-md shadow-lg w-40">
                  <ul className="p-2">
                    <li className="py-1">
                      <button
                        className="block w-full text-left"
                        onClick={() => {
                          router.push("/profile");
                        }}
                      >
                        Profile
                      </button>
                    </li>
                    <li className="py-1">
                      <button
                        className="block w-full text-left"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <button className="text-white px-4 py-2" onClick={handleLogin}>
                Log in
              </button>
            )}
          </div>
        </div>
      </nav>

      
      <div className="container mx-auto max-w-6xl mt-8 px-4">
        
        {user && !isLoadingRecommendations && recommendedMovies && recommendedMovies.length > 0 && (
          <>
            <h1 className="text-3xl font-bold text-black mb-6">
              Recommended Movies
            </h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {shuffleArray(recommendedMovies).slice(0, 8).map((movie: Movie) => ( // Shuffle and display only 8 recommendations
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </div>
          </>
        )}

        
        <h1 className="text-3xl font-bold text-black mb-6">
          Explore Movies by Genre
        </h1>

        {randomGenres.map((genre) => (
          <div key={genre.id} className="mb-12">
            <h2 className="text-2xl font-semibold text-black mb-4">
              {genre.name}
            </h2>
            {moviesByGenre[genre.name] ? (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {moviesByGenre[genre.name].map((movie) => (
                  <MovieCard movie={movie} key={movie.id} />
                ))}
              </div>
            ) : (
              <p>Loading movies...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;

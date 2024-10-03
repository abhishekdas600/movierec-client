import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axiosInstance from "@/config/config"; 
import { Movie } from "@/hooks/movie"; 
import { useCurrentUser } from "@/hooks/user"; 
import { useGetWatchlist, useGetFavourites } from "@/hooks/watchlist"; 
import { useQueryClient } from "@tanstack/react-query"; 

const MoviePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<Movie | null>(null);
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: watchlist } = useGetWatchlist();
  const { data: favourites } = useGetFavourites();

  
  const isInWatchlist = watchlist?.some(item => item.tmdb_id === movie?.id);
  const isInFavourites = favourites?.some(item => item.tmdb_id === movie?.id);

  useEffect(() => {
    if (id) {
      const fetchMovieDetails = async () => {
        try {
          const response = await axiosInstance.get<Movie>(`/movies/${id}`);
          setMovie(response.data);
          console.log(response.data);
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      };

      fetchMovieDetails();
    }
  }, [id]);

  const handleLogin = useCallback(async () => {
    if (user) {
      console.error("User already exists");
      return;
    }
    try {
      window.location.href = `${axiosInstance.defaults.baseURL}/auth/google`;
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleHome = () => {
    router.push("/");
  };

  
  const handleAddToWatchlist = async () => {
    if (!user) {
      console.error("User must be logged in to add to watchlist");
      return;
    }
    try {
      await axiosInstance.post(`/addwatchlist/${movie?.id}`);
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }); 
      console.log(`${movie?.title} added to watchlist.`);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  
  const handleRemoveFromWatchlist = async () => {
    if (!user) {
      console.error("User must be logged in to remove from watchlist");
      return;
    }
    try {
      await axiosInstance.post(`/removefromwatchlist/${movie?.id}`); 
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }); 
      console.log(`${movie?.title} removed from watchlist.`);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

 
  const handleAddToFavorites = async () => {
    if (!user) {
      console.error("User must be logged in to add to favorites");
      return;
    }
    try {
      await axiosInstance.post(`/addtofavourites/${movie?.id}`);
      queryClient.invalidateQueries({ queryKey: ["favourites"] }); 
      console.log(`${movie?.title} added to favorites.`);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  
  const handleRemoveFromFavorites = async () => {
    if (!user) {
      console.error("User must be logged in to remove from favorites");
      return;
    }
    try {
      await axiosInstance.post(`/removefromfavourites/${movie?.id}`); 
      queryClient.invalidateQueries({ queryKey: ["favourites"] }); 
      console.log(`${movie?.title} removed from favorites.`);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  if (!movie) return <p className="text-white">Loading...</p>;

  return (
    <>
      
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between max-w-6xl">
          <button className="text-white text-xl font-bold" onClick={handleHome}>MovieRec</button>

          <div className="flex items-center space-x-4">
          <div className="relative group">
          <button className="text-white px-4 py-2"onClick={()=>{router.push('/explore')}}>Explore</button>
          </div>
            
            {user ? (
              <div className="relative group">
                <button className="text-white px-4 py-2">{user.name}</button>
                <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded-md shadow-lg w-40">
                  <ul className="p-2">
                    <li className="py-1">
                      <button className="block w-full text-left"onClick={()=>{router.push(`/profile`)}}>Profile</button>
                    </li>
                    <li className="py-1">
                      <button className="block w-full text-left" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <button className="text-white px-4 py-2" onClick={handleLogin}>Log in</button>
            )}
          </div>
        </div>
      </nav>

      
      <div className="container mx-auto max-w-6xl mt-6 flex flex-col md:flex-row">
        
        <div className="md:w-1/3 w-full flex justify-center md:justify-start">
          <div className="relative w-72">
            <Image
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
              alt={movie.title}
              width={300}
              height={450}
              layout="responsive"
              className="rounded-lg"
            />
          </div>
        </div>

        
        <div className="md:w-2/3 w-full md:pl-8 mt-4 md:mt-0">
          <h1 className="text-black text-3xl font-bold">{movie.title}</h1>

         
          <p className="text-black mt-2">
            <strong>Rating:</strong> {movie.vote_average} / 10
          </p>

          
          <p className="text-black mt-2">
            <strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}
          </p>

          
          <p className="text-black mt-2">
            <strong>Status:</strong> {movie.status}
          </p>

          
          <p className="text-black mt-2">
            <strong>Genres:</strong> {movie.genres.map(genre => genre.name).join(', ')}
          </p>

         
          <p className="text-black mt-4"><strong>Overview: </strong>{movie.overview}</p>

          
          {user&&<div className="mt-4">
            {isInWatchlist ? (
              <button
                onClick={handleRemoveFromWatchlist}
                className="bg-red-600 text-white px-4 py-2 rounded-md mr-2"
              >
                Remove from Watchlist
              </button>
            ) : (
              <button
                onClick={handleAddToWatchlist}
                className="bg-green-600 text-white px-4 py-2 rounded-md mr-2"
              >
                Add to Watchlist
              </button>
            )}
            {isInFavourites ? (
              <button
                onClick={handleRemoveFromFavorites}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Remove from Favorites
              </button>
            ) : (
              <button
                onClick={handleAddToFavorites}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md"
              >
                Add to Favorites
              </button>
            )}
          </div>}

          
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <>
              <h2 className="text-black mt-6 font-bold text-xl">Cast</h2>
              <ul className="text-black mt-2">
                {movie.credits.cast.map(castMember => (
                  <li key={castMember.id}>
                    {castMember.name} as {castMember.character}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MoviePage;

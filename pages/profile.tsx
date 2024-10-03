import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/config/config";
import { useCurrentUser } from "@/hooks/user";
import { useGetWatchlist, useGetFavourites } from "@/hooks/watchlist";
import { useQueryClient } from "@tanstack/react-query";
import {  useGetMoviesById } from "@/hooks/movie";

import Image from "next/image";
import Link from "next/link";



const SimpleMovieCard: React.FC<{
  imageUrl: string;
  tmdb_id: string;
  onDelete: () => void; 
}> = ({ imageUrl, tmdb_id, onDelete }) => {
  return (
    <div className="relative w-48 h-72">
     
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
      >
        &times;
      </button>
      
      <Link href={`/movie/${tmdb_id}`}>
        <div className="w-full h-full cursor-pointer">
          <Image
            src={imageUrl}
            alt="Movie Poster"
            className="w-full h-full object-cover rounded-lg hover:shadow-lg transition-shadow"
            height={350}
            width={200}
          />
        </div>
      </Link>
    </div>
  );
};


const MovieItem: React.FC<{ tmdb_id: string; onRemove: () => void }> = ({
  tmdb_id,
  onRemove,
}) => {
  const { data: movie, isLoading } = useGetMoviesById(tmdb_id);

  if (isLoading)
    return (
      <div className="w-48 h-72 bg-gray-200 animate-pulse rounded-lg"></div>
    );
  if (!movie || !movie.poster_path) return null;

  
  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return <SimpleMovieCard imageUrl={imageUrl} tmdb_id={`${movie.id}`} onDelete={onRemove} />;
};


const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const { data: watchlist, isLoading: watchlistLoading } = useGetWatchlist();
  const { data: favourites, isLoading: favouritesLoading } = useGetFavourites();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/");
    }
  }, [userLoading, user, router]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Logout failed. Please try again.");
    }
  };

  const handleHome = () => {
    router.push("/");
  };

 
  const removeMovie = async (id: string, type: "watchlist" | "favourites") => {
    try {
      await axiosInstance.post(`removefrom${type}/${id}`); 
      queryClient.invalidateQueries({ queryKey: [type] }); 
    } catch (error) {
      console.error(`Error removing from ${type}:`, error);
      setError(`Failed to remove movie. Please try again.`);
    }
  };

  if (userLoading || watchlistLoading || favouritesLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>No user found.</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between max-w-6xl">
          <button className="text-white text-xl font-bold" onClick={handleHome}>
            MovieRec
          </button>

          <div className="flex items-center space-x-4">
          <div className="relative group">
          <button className="text-white px-4 py-2"onClick={()=>{router.push('/explore')}}>Explore</button>
          </div>
            <div className="relative group">
              <button className="text-white px-4 py-2">{user.name}</button>
              <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded-md shadow-lg w-40">
                <ul className="p-2">
                  <li className="py-1">
                    <button className="block w-full text-left" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      
      <div className="container mx-auto max-w-6xl mt-8 px-4">
        <div className="bg-white text-black p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-700">{user.email}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl mt-8 px-4">
        <h2 className="text-black text-2xl font-bold mb-4">Watchlist</h2>
        {watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((item) => (
              <MovieItem
                key={item.id}
                tmdb_id={item.tmdb_id.toString()}
                onRemove={() => removeMovie(item.tmdb_id.toString(), "watchlist")}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No movies in watchlist.</p>
        )}

        <h2 className="text-black text-2xl font-bold mt-12 mb-4">Favorites</h2>
        {favourites && favourites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favourites.map((item) => (
              <MovieItem
                key={item.id}
                tmdb_id={item.tmdb_id.toString()}
                onRemove={() => removeMovie(item.tmdb_id.toString(), "favourites")}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No favorites yet.</p>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
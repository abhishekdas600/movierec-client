import React, { useCallback, useState } from "react";
import { useGetGenres } from "@/hooks/movie";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/config";
import { useRouter } from "next/router";

interface NavbarProps {
  selectedGenres: number[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<number[]>>;
  selectedFilter: string;
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function Navbar({
  selectedGenres,
  setSelectedGenres,
  selectedFilter,
  setSelectedFilter,
  setSearchQuery,
  setCurrentPage,
}: NavbarProps) {
  const filters: string[] = ["recent", "top_rated", "popular"];
  const { genres } = useGetGenres();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState<string>("");
  const router = useRouter()
  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((g) => g !== genreId) : [...prev, genreId]
    );
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleSearchSubmit = () => {
    if (searchInput.trim() !== "") {
      setSearchQuery(searchInput);
      setSelectedGenres([]);
      setSelectedFilter("top_rated"); 
      setCurrentPage(1); 
      console.log("Search query:", searchInput);
    }
  };
  const handleProfile = ()=>{
    router.push('/profile')
  }
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

  const handleHome = ()=>{
    setSearchQuery("");
    setSelectedGenres([]);
    setSelectedFilter("popular");
    setSearchInput(""); 
    setCurrentPage(1); 
    router.push("/"); 
  }

  const handleLogout = useCallback(async () => {
    if (!user) {
      console.error("User doesn't exist");
      return;
    }
    try {
      await axiosInstance.get("/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    } catch (error) {
      console.error(error);
    }
  }, [queryClient, user]);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between max-w-6xl">
        <button className="text-white text-xl font-bold"onClick={handleHome}>MovieRec</button>

        <div className="flex items-center space-x-4">
          <div className="relative group">
          <button className="text-white px-4 py-2"onClick={()=>{router.push('/explore')}}>Explore</button>
          </div>
          
          <div className="relative group">
            <button className="text-white px-4 py-2">Genres</button>
            <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded-md shadow-lg w-40 z-50">
              <ul className="p-2">
                {genres &&
                  genres.map((genre) => (
                    <li key={genre.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => toggleGenre(genre.id)}
                        className="mr-2"
                      />
                      <span>{genre.name}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

         
          <div className="relative group">
            <button className="text-white px-4 py-2">Filter</button>
            <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded-md shadow-lg w-40 z-50">
              <ul className="p-2">
                {filters.map((filter) => (
                  <li key={filter} className="py-1">
                    <button
                      className={`block w-full text-left ${
                        selectedFilter === filter ? "font-bold text-indigo-600" : ""
                      }`}
                      onClick={() => handleFilterChange(filter)}
                    >
                      {filter}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

         
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for movies..."
              className="px-4 py-2 rounded-md bg-gray-700 text-white"
            />
            <button
              onClick={handleSearchSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              Search
            </button>
          </div>

         
          <div className="relative group">
            {user ? (
              <>
                <button className="text-white px-4 py-2">{user.name}</button>
                <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded-md shadow-lg w-40 z-50">
                  <ul className="p-2">
                    <li className="py-1">
                      <button className="block w-full text-left"onClick={handleProfile}>Profile</button>
                    </li>
                    <li className="py-1">
                      <button className="block w-full text-left" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <button className="text-white px-4 py-2" onClick={handleLogin}>
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


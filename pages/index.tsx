

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout";
import { Movie, useMoviesQuery, useSearchMovies } from "@/hooks/movie";
import MovieCard from "@/components/moviecard";

export default function HomePage() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("popular");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading, isError, error } = useMoviesQuery(selectedFilter, selectedGenres, currentPage);
  const { data: searchResults } = useSearchMovies(searchQuery, currentPage);

  const moviesToDisplay = searchQuery ? searchResults?.results : data?.results;

  useEffect(() => {
    setSearchQuery("");
    setSelectedGenres([]);
    setSelectedFilter("popular");
    setCurrentPage(1); 
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  
  const isNextDisabled = () => {
    if (searchQuery) {
      return searchResults && currentPage >= searchResults.total_pages;
    }
    return data && currentPage >= data.total_pages;
  };

  return (
    <>
      <Navbar 
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
      />

      <div className="container mx-auto max-w-6xl">
        <h2 className="text-white text-2xl mt-6">Movies</h2>
        {isLoading && <p className="text-white">Loading...</p>}
        {isError && <p className="text-red-500">{error?.message || "An error occurred"}</p>}
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          {moviesToDisplay && moviesToDisplay.length > 0 ? (
            moviesToDisplay.map((movie: Movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          ) : (
            <p className="text-white">No movies available.</p>
          )}
        </div>

        
        <div className="flex justify-between mt-4">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">Page {currentPage}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={isNextDisabled()} 
            className="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}


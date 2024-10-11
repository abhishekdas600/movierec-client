

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axiosInstance from "@/config/config"; 
import { Movie } from "@/hooks/movie";
import Link from "next/link"; 

interface MovieCardProps {
  movie: Movie;
}

interface Trailer {
  id: string;
  key: string; 
  name: string;
  official: boolean;
  type: string;
  published_at: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasTrailer, setHasTrailer] = useState<boolean>(true);

  
  useEffect(() => {
    const fetchTrailer = async () => {
      if (isHovered && !trailerKey && hasTrailer) {
        try {
          const response = await axiosInstance.get<Trailer>(`/trailer/${movie.id}`);

          if (response.data.key) {
            setTrailerKey(response.data.key); 
          } else {
            setHasTrailer(false); 
          }
        } catch (error) {
          console.error("Error fetching trailer:", error);
          setHasTrailer(false); 
        }
      }
    };

    fetchTrailer();
  }, [isHovered, trailerKey, hasTrailer, movie.id]);

  return (
    <div
      className="movie-card relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      <div className="relative">
        <Image
          src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} 
          alt={movie.title}
          width={300}
          height={450}
          layout="responsive" 
          className="rounded-lg"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            {trailerKey ? (
              <iframe
                width="300"
                height="450"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0`}
                title={movie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p className="text-black text-center">No trailer available</p>
            )}
          </div>
        )}
      </div>

      
      <Link href={`/movie/${movie.id}`} passHref>
        <h3 className="text-black mt-10 text-center cursor-pointer">{movie.title}</h3>
      </Link>
    </div>
  );
};

export default MovieCard;


import { API_URL } from "@/app/detail/[movieId]/page";
import { Cast, Credits, Genre, Movie } from "@/models/movie.model";

interface Props {
  movieId: string;
}

export async function getMovie(movieId: string): Promise<Movie> {
  try {
    const response = await fetch(`${API_URL}/${movieId}?api_key=${process.env.API_KEY}&language=ko-KR`);
    return response.json();
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw error;
  }
}

export async function getMovieCredits(movieId: string): Promise<Credits> {
  try {
    const response = await fetch(`${API_URL}/${movieId}/credits?api_key=${process.env.API_KEY}&language=ko-KR`);
    return response.json();
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    throw error;
  }
}

export default async function MovieInfo({movieId}: Props) {
  const movie = await getMovie(movieId);
  const credits = await getMovieCredits(movieId);

  return (
    <div>
      <div className="mx-auto mt-6 max-w-5xl sm:px-6 lg:max-w-5xl lg:grid lg:grid-cols-3 lg:gap-x-8 lg:px-8">
        <div className="col-span-1">
          <img 
            className="w-full max-w-sm h-auto rounded-lg shadow-lg sm:mb-4" 
            src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`} 
            alt={movie.title}/>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="text-4xl font-bold mb-8">{movie.title}</div>
          
          <div className="flex flex-wrap space-x-10 text-lg">
            <div className="font-bold">장르</div>
            <div className="flex flex-wrap space-x-3">
              {movie.genres.map((genre: Genre) => (
                <span key={genre.id}>{genre.name}</span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap space-x-10 text-lg">
            <div className="font-bold">개요</div>
            <div>{movie.origin_country}, {movie.runtime}분</div>
          </div>

          <div className="flex flex-wrap space-x-10 text-lg">
            <div className="font-bold">개봉</div>
            <div>{movie.release_date}</div>
          </div>

          <div className="flex flex-wrap space-x-10 text-lg">
            <div className="font-bold">평점</div>
            <div>★ {movie.vote_average.toFixed(1)}</div>
          </div>


          <div className="text-sm">{movie.overview}</div>

        </div>
      </div>

      <div className="mx-auto mt-6 max-w-5xl sm:px-6 lg:max-w-5xl lg:grid lg:gap-x-8 lg:px-8  space-y-3">
        <div className="font-bold text-lg">출연진</div>
        <div className="flex overflow-x-scroll space-x-3">
          {credits.cast.map((cast: Cast) => (
            <div key={cast.id} className="flex-shrink-0 w-20">
              <div className="flex flex-col items-center">
                {cast.profile_path 
                ? <img 
                    className="w-full h-auto rounded-lg shadow-lg" 
                    src={`https://image.tmdb.org/t/p/original/${cast.profile_path}`} 
                    alt={cast.name}
                  />
                : <div className="mt-2 w-full h-28 bg-slate-500 rounded-lg shadow-lg"></div>
                }
                <div className="mt-2 text-center text-xs">{cast.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
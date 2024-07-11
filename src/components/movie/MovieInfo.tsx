import { API_URL } from '@/constants';
import { Credits, Genre, Movie, SimilarMovieInfo } from '@/models/movie.model';
import ErrorOMG from '@/app/detail/[movieId]/error';
import ReviewsList from '../review/ReviewsList';
import Image from 'next/image';
import MovieCredits from './MovieCredits';
import MovieSimilar from './MovieSimilar';

interface Props {
  movieId: string;
}

export async function getMovie(movieId: string): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error('Error fetching movie:', data.status_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }
}

export async function getMovieCredits(
  movieId: string
): Promise<Credits | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error('Error fetching movie credits:', data.status_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
}

export async function getSimilarMovies(
  movieId: string
): Promise<SimilarMovieInfo | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}/similar?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error('Error fetching similar movie:', data.status_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching similar movie:', error);
    throw error;
  }
}

export default async function MovieInfo({ movieId }: Props) {
  const movie = await getMovie(movieId);
  const credits = await getMovieCredits(movieId);
  const similarMovies = await getSimilarMovies(movieId);

  if (!movie) {
    return <ErrorOMG />;
  }

  if (!credits) {
    return <ErrorOMG />;
  }

  if (!similarMovies) {
    return <ErrorOMG />;
  }

  return (
    <div>
      <div className='mx-auto mt-6 max-w-5xl sm:px-6 lg:max-w-5xl lg:grid lg:grid-cols-3 lg:gap-x-8 lg:px-8'>
        <div className='col-span-1'>
          <Image
            className='w-full max-w-sm h-auto rounded-lg shadow-lg sm:mb-4'
            src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
            alt={movie.title}
            width={500}
            height={500}
          />
        </div>

        <div className='col-span-2 space-y-6'>
          <div className='text-4xl font-bold mb-8'>{movie.title}</div>

          <div className='flex flex-wrap space-x-10 text-lg'>
            <div className='font-bold'>장르</div>
            <div className='flex flex-wrap space-x-3'>
              {movie.genres.map((genre: Genre) => (
                <span key={genre.id}>{genre.name}</span>
              ))}
            </div>
          </div>

          <div className='flex flex-wrap space-x-10 text-lg'>
            <div className='font-bold'>개요</div>
            <div>
              {movie.origin_country}, {movie.runtime}분
            </div>
          </div>

          <div className='flex flex-wrap space-x-10 text-lg'>
            <div className='font-bold'>개봉</div>
            <div>{movie.release_date}</div>
          </div>

          <div className='flex flex-wrap space-x-10 text-lg'>
            <div className='font-bold'>평점</div>
            <div>★ {movie.vote_average.toFixed(1)}</div>
          </div>

          <div className='text-sm'>{movie.overview}</div>
        </div>
      </div>
      <MovieCredits cast={credits.cast} />
      <MovieSimilar similarMovies={similarMovies.results} />
      <ReviewsList
        movieId={Number(movieId)}
        movieTitle={movie.title}
        posterPath={movie.poster_path}
      />
    </div>
  );
}

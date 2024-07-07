import { API_URL } from '@/constants';
import { Credits, Genre, Movie } from '@/models/movie.model';
import MovieCredits from './MovieCredits';
import ErrorOMG from '@/app/detail/[movieId]/error';
import ReviewsList from '../Review/ReviewsList';
import Image from 'next/image';
import MovieLikeButton from '../Like/MovieLikeButton';

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

export default async function MovieInfo({ movieId }: Props) {
  const movie = await getMovie(movieId);
  const credits = await getMovieCredits(movieId);

  if (!movie) {
    return <ErrorOMG />;
  }

  if (!credits) {
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
            priority
          />
        </div>

        <div className='col-span-2 space-y-6'>
          <div className='flex space-x-5 text-4xl mb-8'>
            <div className='font-bold'>{movie.title}</div>
            <div><MovieLikeButton type={'one'} movieId={Number(movieId)} movieTitle={movie.title} posterPath={movie.poster_path} /></div>
          </div>

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
      <ReviewsList movieId={Number(movieId)} />
    </div>
  );
}

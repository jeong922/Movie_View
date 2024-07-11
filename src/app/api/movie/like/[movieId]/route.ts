import { authOptions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { Like } from '@/models/likes.model';
import { formatUserId } from '@/utils/formatUserId';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

interface LikeQueryResult extends Like, RowDataPacket {}

interface ILike {
  id: string;
  movies_id: string;
  movie_title: string;
  poster_path: string;
  social_accounts_uid: string | undefined;
}

export const GET = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    if (!social_accounts_uid) {
      return new Response('Authentication Error', { status: 401 });
    }

    const result = await getLike(params.movieId, social_accounts_uid);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const POST = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    if (!social_accounts_uid) {
      return new Response('Authentication Error', { status: 401 });
    }

    const movieData = await req.json()

    const like = {
      id: uuidv4().replace(/-/g, ''),
      movies_id: params.movieId,
      movie_title: movieData.movieTitle,
      poster_path: movieData.posterPath,
      social_accounts_uid: social_accounts_uid,
    };

    const result = await postLike(like);
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    const result = await deleteLike(params.movieId, social_accounts_uid as string);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

async function getLike(
  reviewId: string,
  social_accounts_uid: string
): Promise<LikeQueryResult> {
  let connection = await dbConnectionPoolAsync.getConnection();
  const sql = `SELECT 
                COALESCE(SUM(CASE WHEN social_accounts_uid = ? THEN 1 ELSE 0 END), 0) AS liked,
                COUNT(*) AS likes
              FROM movie_view.movies_likes
              WHERE movies_id = ?;`;

  try {
    const [result] = await connection
      .execute<LikeQueryResult[]>(sql, [social_accounts_uid, reviewId]);
    
    connection.release();
    return result[0];
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}

async function postLike(like: ILike) {
  let connection = await dbConnectionPoolAsync.getConnection();
  const sql = `INSERT IGNORE INTO movie_view.movies_likes (id, movies_id, movie_title, poster_path, social_accounts_uid )
             VALUES ( UNHEX(?), ?, ?, ?, ? );`;

  try {
    const [result] = await connection
      .execute(sql, [like.id, like.movies_id, like.movie_title, like.poster_path, like.social_accounts_uid ]);

    connection.release();  
    return result;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}

async function deleteLike(movieId: string, social_accounts_uid: string) {
  const connection = await dbConnectionPoolAsync.getConnection();
  const sql = `DELETE FROM movie_view.movies_likes WHERE movies_id=? AND social_accounts_uid=?;`;

  try {
    const [result] = await connection
      .execute(sql, [movieId, social_accounts_uid]);

    connection.release();
    return result;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}
import { FormEvent, useState } from 'react';
import ReviewForm from './ReviewForm';
import { ReviewFormData } from '@/models/review.model';
import { useReview } from '@/hooks/useReview';

interface Props {
  movieId: number;
  sort: string;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
}

export default function ReviewFormContainer({
  movieId,
  setIsFormOpen,
  text,
  sort,
}: Props) {
  const { addMyReview } = useReview(movieId, sort);
  const [reviewData, setReviewData] = useState<ReviewFormData>({
    title: '',
    rating: 0,
    content: '',
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setReviewData({
      title: '',
      rating: 0,
      content: '',
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newReview = {
      movieId,
      title: reviewData.title.trim(),
      content: reviewData.content.trim(),
      rating: reviewData.rating,
    };

    if (newReview.title.length === 0 || newReview.content.length === 0) {
      window.alert('리뷰 제목과 내용은 최소 한 글자 이상 입력해 주세요.');
      return;
    }

    addMyReview(
      newReview.movieId,
      newReview.title,
      newReview.rating,
      newReview.content
    );

    setReviewData({
      title: '',
      rating: 0,
      content: '',
    });

    setIsFormOpen(false);
  };

  return (
    <ReviewForm
      text={text}
      review={reviewData}
      handleCloseForm={handleCloseForm}
      setReview={setReviewData}
      onSubmit={handleSubmit}
    />
  );
}

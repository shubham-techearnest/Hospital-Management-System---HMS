import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import type { PagedReviews } from '@/features/public/api/publicProfileApi';

interface ReviewsSectionProps {
  title?: string;
  queryKey: readonly unknown[];
  fetchReviews: (page: number) => Promise<PagedReviews>;
}

export function ReviewsSection({ title = 'Reviews', queryKey, fetchReviews }: ReviewsSectionProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => fetchReviews(page),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Unable to load reviews.</Typography>;
  }

  const reviews = data?.content ?? [];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
      {reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Card key={review.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography fontWeight={600}>{review.reviewerName}</Typography>
                  <Rating value={review.rating} readOnly size="small" />
                </Stack>
                {review.comment ? (
                  <Typography sx={{ mb: 1 }}>{review.comment}</Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>
            Page {page + 1} of {data.totalPages}
          </Typography>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </Box>
  );
}

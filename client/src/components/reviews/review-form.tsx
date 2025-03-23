import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { EditableRating } from '@/components/ui/editable-rating';

interface ReviewFormProps {
  bookingId: number;
  initialRating?: number | null;
  initialReviewText?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Review form schema
const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  reviewText: z.string().min(10, 'Review should be at least 10 characters').max(500, 'Review should not exceed 500 characters')
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm({ 
  bookingId, 
  initialRating = null, 
  initialReviewText = '', 
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form with default values and schema validation
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialRating || 0,
      reviewText: initialReviewText || ''
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call API to update booking review
      await apiRequest('PUT', `/api/gardener-booking/${bookingId}/review`, data);
      
      // Show success toast
      toast({
        title: 'Review Submitted',
        description: 'Thank you for sharing your feedback!',
        variant: 'default',
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    form.setValue('rating', rating);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Rating Input */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700">Your Rating</FormLabel>
              <FormControl>
                <EditableRating 
                  initialRating={field.value}
                  size="lg"
                  onChange={handleRatingChange}
                  readonly={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Review Text Input */}
        <FormField
          control={form.control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700">Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with our gardening service..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerCareModal({ isOpen, onClose }: CustomerCareModalProps) {
  const { toast } = useToast();
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType) {
      toast({
        title: "Error",
        description: "Please select an issue type",
        variant: "destructive",
      });
      return;
    }
    
    if (!message) {
      toast({
        title: "Error",
        description: "Please describe your issue",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate API call
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request Submitted",
        description: "Our team will get back to you shortly.",
        variant: "default",
      });
      
      // Reset form and close modal
      setIssueType('');
      setMessage('');
      onClose();
    }, 1500);
  };

  const issueTypes = [
    { id: 'order', label: 'Order Issues', icon: 'shopping-bag' },
    { id: 'delivery', label: 'Delivery Issues', icon: 'truck' },
    { id: 'product', label: 'Product Quality', icon: 'seedling' },
    { id: 'payment', label: 'Payment Issues', icon: 'credit-card' },
    { id: 'account', label: 'Account Issues', icon: 'user-circle' },
    { id: 'other', label: 'Other', icon: 'question-circle' },
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <i className="fas fa-headset text-primary mr-2"></i>
            Customer Support
          </DialogTitle>
          <DialogDescription>
            Please let us know how we can help you today.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="issue-type">Select Issue Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {issueTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  className={`flex items-center p-3 rounded-lg border text-left hover:border-primary hover:bg-primary/5 transition-colors ${
                    issueType === type.id ? 'border-primary bg-primary/10' : 'border-gray-200'
                  }`}
                  onClick={() => setIssueType(type.id)}
                >
                  <i className={`fas fa-${type.icon} text-primary mr-2`}></i>
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              placeholder="your.email@example.com" 
              type="email" 
              defaultValue="john.doe@example.com"
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">We'll respond to the email associated with your account</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">How can we help you?</Label>
            <Textarea 
              id="message" 
              placeholder="Please describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="ml-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">
                    <i className="fas fa-circle-notch"></i>
                  </span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethod } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const cardFormSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be in format MM/YY"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  onSuccess?: () => void;
}

export function AddPaymentMethodModal({ 
  isOpen, 
  onClose, 
  paymentMethods,
  onSuccess
}: AddPaymentMethodModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const { toast } = useToast();
  
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    },
  });
  
  const onSubmit = async (data: CardFormValues) => {
    try {
      // In a real implementation, this would send the data to Stripe
      console.log('Form data submitted:', data);
      
      // For now, just simulate success
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been saved successfully.",
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "There was a problem adding your payment method. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Find available payment methods that require card details (like credit/debit cards)
  const cardBasedMethods = paymentMethods?.filter(method => method.requiresCardDetails) || [];
  // Find digital wallet payment methods
  const digitalWallets = paymentMethods?.filter(method => method.isDigitalWallet) || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Payment Method</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method for faster checkout.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="card" onValueChange={setSelectedPaymentMethod} className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="digital">Digital Wallet</TabsTrigger>
          </TabsList>
          
          {/* Credit/Debit Card Tab */}
          <TabsContent value="card">
            <Form {...cardForm}>
              <form onSubmit={cardForm.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={cardForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234 5678 9012 3456" 
                          {...field} 
                          onChange={(e) => {
                            // Format card number with spaces every 4 digits
                            const value = e.target.value.replace(/\s/g, '');
                            const formatted = value
                              .replace(/[^\d]/g, '')
                              .slice(0, 16);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cardForm.control}
                  name="cardHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={cardForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM/YY" 
                            {...field} 
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^\d]/g, '');
                              if (value.length > 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              field.onChange(value);
                            }}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={cardForm.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                              field.onChange(value);
                            }}
                            maxLength={4}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit">Add Payment Method</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          {/* Digital Wallets Tab */}
          <TabsContent value="digital" className="py-4">
            <div className="space-y-4">
              {digitalWallets.length > 0 ? (
                digitalWallets.map((wallet) => (
                  <div 
                    key={wallet.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => {
                      toast({
                        title: `Connect to ${wallet.name}`,
                        description: "This would open a secure connection to your digital wallet.",
                        variant: "default",
                      });
                    }}
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                      <i className={`fab fa-${wallet.icon} text-blue-600 text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium">{wallet.name}</h3>
                      <p className="text-sm text-gray-500">Connect your account</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No digital wallet options available</p>
                </div>
              )}
              
              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
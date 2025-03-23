import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Log that this page was accessed
    console.log('Checkout page accessed');
  }, []);
  
  return (
    <div className="container mobile-container">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-3 sm:mr-4 touch-target" 
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-xl sm:text-2xl">Checkout</h1>
      </div>
      
      <Card className="p-6 flex flex-col items-center text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Functionality Disabled</h2>
        <p className="text-gray-600 mb-4">
          The order and checkout functionality has been disabled in this version of the application.
        </p>
        <Button 
          onClick={() => setLocation('/')}
          className="mt-2"
        >
          Return to Home
        </Button>
      </Card>
    </div>
  );
}
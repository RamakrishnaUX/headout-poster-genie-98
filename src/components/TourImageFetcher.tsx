import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TourImageFetcherProps {
  onImageSelect: (imageUrl: string) => void;
}

const TourImageFetcher: React.FC<TourImageFetcherProps> = ({ onImageSelect }) => {
  const [tourNumber, setTourNumber] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTourImages = async () => {
    if (!tourNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tour number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/fetch-tour-images?tourNumber=${tourNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tour images');
      }

      if (data.images.length === 0) {
        toast({
          title: "No Images Found",
          description: "No images were found for this tour number",
          variant: "destructive",
        });
        return;
      }

      setImages(data.images);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch tour images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter tour number (e.g., 18695)"
          value={tourNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
            setTourNumber(value);
          }}
          className="flex-1"
        />
        <Button 
          onClick={fetchTourImages}
          disabled={isLoading}
          variant="outline"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => onImageSelect(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Tour image ${index + 1}`}
                className="w-[100px] h-[100px] object-cover rounded-lg transition-transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourImageFetcher; 
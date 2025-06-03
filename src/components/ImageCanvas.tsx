
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';

interface ImageCanvasProps {
  title: string;
  subtitle: string;
  ctaText: string;
  uploadedImage: string | null;
}

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ title, subtitle, ctaText, uploadedImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageTransform, setImageTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const getImageBounds = () => {
      const cardX = 70;
      const cardY = 90;
      const cardWidth = 760;
      const cardHeight = 1420;
      const buttonY = cardY + 180 + (title.split('\n').length * 65) + 20 + 80;
      
      return {
        x: cardX + 30,
        y: buttonY + 120,
        width: cardWidth - 60,
        height: cardHeight - (buttonY + 120 - cardY) - 30
      };
    };

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
      if (!uploadedImage || !imageLoaded) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      const bounds = getImageBounds();
      
      // Check if click is within image bounds
      if (mouseX >= bounds.x && mouseX <= bounds.x + bounds.width &&
          mouseY >= bounds.y && mouseY <= bounds.y + bounds.height) {
        
        // Check if clicking near corners for resize (20px threshold)
        const cornerThreshold = 20;
        const isNearCorner = 
          (mouseX >= bounds.x + bounds.width - cornerThreshold && mouseY >= bounds.y + bounds.height - cornerThreshold);
        
        if (isNearCorner) {
          setIsResizing(true);
        } else {
          setIsDragging(true);
        }
        
        setLastMousePos({ x: mouseX, y: mouseY });
      }
    }, [uploadedImage, imageLoaded, title]);

    const handleMouseMove = useCallback((event: React.MouseEvent) => {
      if (!isDragging && !isResizing) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      const deltaX = mouseX - lastMousePos.x;
      const deltaY = mouseY - lastMousePos.y;

      if (isDragging) {
        setImageTransform(prev => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      } else if (isResizing) {
        const scaleFactor = 1 + (deltaX + deltaY) / 200;
        setImageTransform(prev => ({
          ...prev,
          scale: Math.max(0.1, Math.min(3, prev.scale * scaleFactor))
        }));
      }

      setLastMousePos({ x: mouseX, y: mouseY });
    }, [isDragging, isResizing, lastMousePos]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setIsResizing(false);
    }, []);

    const drawCard = async (ctx: CanvasRenderingContext2D) => {
      // Create gradient background (blurred image or default)
      if (uploadedImage) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = uploadedImage;
          });

          // Draw blurred background
          ctx.filter = 'blur(15px) brightness(0.7)';
          ctx.drawImage(img, 0, 0, 900, 1600);
          ctx.filter = 'none';
        } catch (error) {
          console.error('Error loading image:', error);
          // Fallback to gradient background
          const gradient = ctx.createLinearGradient(0, 0, 900, 1600);
          gradient.addColorStop(0, '#60a5fa');
          gradient.addColorStop(1, '#3b82f6');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 900, 1600);
        }
      } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, 900, 1600);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 900, 1600);
      }

      // Draw main purple card
      const cardX = 70;
      const cardY = 90;
      const cardWidth = 760;
      const cardHeight = 1420;
      const cardRadius = 40;

      // Purple gradient for the card
      const purpleGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
      purpleGradient.addColorStop(0, '#a855f7');
      purpleGradient.addColorStop(1, '#7c3aed');

      ctx.fillStyle = purpleGradient;
      drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, cardRadius);
      ctx.fill();

      // Draw Headout logo placeholder (white text for now)
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🏊 headout', cardX + 50, cardY + 80);

      // Draw title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 54px Arial';
      ctx.textAlign = 'left';
      
      const titleLines = title.split('\n');
      let titleY = cardY + 180;
      titleLines.forEach((line) => {
        ctx.fillText(line, cardX + 50, titleY);
        titleY += 65;
      });

      // Draw subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '32px Arial';
      ctx.fillText(subtitle, cardX + 50, titleY + 20);

      // Draw CTA button
      const buttonX = cardX + 50;
      const buttonY = titleY + 80;
      const buttonWidth = 220;
      const buttonHeight = 60;
      const buttonRadius = 30;

      ctx.fillStyle = 'white';
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
      ctx.fill();

      // CTA text
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ctaText, buttonX + buttonWidth / 2, buttonY + 38);

      // Draw image container with rounded corners
      if (uploadedImage) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              setImageLoaded(img);
              resolve(null);
            };
            img.onerror = reject;
            img.src = uploadedImage;
          });

          const bounds = getImageBounds();
          const imageRadius = 30;

          // Create clipping path for rounded image
          ctx.save();
          drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, imageRadius);
          ctx.clip();

          // Calculate image dimensions with transform
          const imgAspectRatio = img.width / img.height;
          const containerAspectRatio = bounds.width / bounds.height;
          
          let baseWidth, baseHeight;
          
          if (imgAspectRatio > containerAspectRatio) {
            baseHeight = bounds.height;
            baseWidth = baseHeight * imgAspectRatio;
          } else {
            baseWidth = bounds.width;
            baseHeight = baseWidth / imgAspectRatio;
          }

          // Apply transform
          const scaledWidth = baseWidth * imageTransform.scale;
          const scaledHeight = baseHeight * imageTransform.scale;
          
          const drawX = bounds.x + (bounds.width - scaledWidth) / 2 + imageTransform.x;
          const drawY = bounds.y + (bounds.height - scaledHeight) / 2 + imageTransform.y;

          ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
          ctx.restore();

          // Draw resize handle when image is present
          if (imageLoaded) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(bounds.x + bounds.width - 15, bounds.y + bounds.height - 15, 10, 10);
          }
        } catch (error) {
          console.error('Error drawing main image:', error);
          // Draw placeholder
          const bounds = getImageBounds();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, 30);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Upload an image', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        }
      } else {
        // Draw placeholder for image
        const bounds = getImageBounds();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, 30);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      }
    };

    // Reset transform when image changes
    useEffect(() => {
      if (uploadedImage) {
        setImageTransform({ x: 0, y: 0, scale: 1 });
        setImageLoaded(null);
      }
    }, [uploadedImage]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, 900, 1600);
      
      // Draw the card
      drawCard(ctx);
    }, [title, subtitle, ctaText, uploadedImage, imageTransform]);

    return (
      <canvas
        ref={canvasRef}
        width={900}
        height={1600}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full h-auto cursor-pointer"
        style={{ maxWidth: '450px', height: 'auto' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    );
  }
);

ImageCanvas.displayName = 'ImageCanvas';

export default ImageCanvas;

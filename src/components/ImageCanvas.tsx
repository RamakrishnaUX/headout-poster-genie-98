
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';

interface ImageCanvasProps {
  title: string;
  subtitle: string;
  ctaText: string;
  uploadedImage: string | null;
  uploadedSvg: string | null;
  uploadedLogo: string | null;
}

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ title, subtitle, ctaText, uploadedImage, uploadedSvg, uploadedLogo }, ref) => {
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
      // Image positioned from middle to 100px from bottom, avoiding CTA area
      return {
        x: 0,
        y: 650, // Start from middle-ish area
        width: 900,
        height: 850 // 1600 - 650 - 100 (bottom padding)
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
        
        // Check if clicking near corners for resize (30px threshold)
        const cornerThreshold = 30;
        const isNearCorner = 
          (mouseX >= bounds.x + bounds.width - cornerThreshold && mouseY >= bounds.y + bounds.height - cornerThreshold);
        
        if (isNearCorner) {
          setIsResizing(true);
        } else {
          setIsDragging(true);
        }
        
        setLastMousePos({ x: mouseX, y: mouseY });
        event.preventDefault();
      }
    }, [uploadedImage, imageLoaded]);

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
        const scaleFactor = 1 + (deltaX + deltaY) / 300;
        setImageTransform(prev => ({
          ...prev,
          scale: Math.max(0.1, Math.min(5, prev.scale * scaleFactor))
        }));
      }

      setLastMousePos({ x: mouseX, y: mouseY });
      event.preventDefault();
    }, [isDragging, isResizing, lastMousePos]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setIsResizing(false);
    }, []);

    const drawCard = async (ctx: CanvasRenderingContext2D) => {
      // Draw blurred background image covering entire frame with better cropping
      if (uploadedImage) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
            bgImg.src = uploadedImage;
          });

          // Calculate dimensions to avoid white edges
          const canvasAspect = 900 / 1600;
          const imageAspect = bgImg.width / bgImg.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imageAspect > canvasAspect) {
            // Image is wider, fit to height and crop width
            drawHeight = 1600;
            drawWidth = drawHeight * imageAspect;
            drawX = -(drawWidth - 900) / 2;
            drawY = 0;
          } else {
            // Image is taller, fit to width and crop height
            drawWidth = 900;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = -(drawHeight - 1600) / 2;
          }

          // Scale up slightly to ensure no white edges
          const scale = 1.1;
          drawWidth *= scale;
          drawHeight *= scale;
          drawX -= (drawWidth - 900) / 2;
          drawY -= (drawHeight - 1600) / 2;

          ctx.filter = 'blur(15px) brightness(0.7)';
          ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);
          ctx.filter = 'none';
        } catch (error) {
          console.error('Error loading background image:', error);
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

      // Draw SVG background with padding
      const svgX = 75;
      const svgY = 100;
      const svgWidth = 750; // 900 - 150 (75px padding on each side)
      const svgHeight = 1400; // 1600 - 200 (100px padding top/bottom)

      if (uploadedSvg) {
        try {
          const svgImg = new Image();
          svgImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            svgImg.onload = resolve;
            svgImg.onerror = reject;
            svgImg.src = uploadedSvg;
          });

          ctx.drawImage(svgImg, svgX, svgY, svgWidth, svgHeight);
        } catch (error) {
          console.error('Error loading SVG:', error);
          // Fallback to purple gradient
          const purpleGradient = ctx.createLinearGradient(svgX, svgY, svgX, svgY + svgHeight);
          purpleGradient.addColorStop(0, '#a855f7');
          purpleGradient.addColorStop(1, '#7c3aed');
          ctx.fillStyle = purpleGradient;
          drawRoundedRect(ctx, svgX, svgY, svgWidth, svgHeight, 40);
          ctx.fill();
        }
      } else {
        // Default purple gradient
        const purpleGradient = ctx.createLinearGradient(svgX, svgY, svgX, svgY + svgHeight);
        purpleGradient.addColorStop(0, '#a855f7');
        purpleGradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = purpleGradient;
        drawRoundedRect(ctx, svgX, svgY, svgWidth, svgHeight, 40);
        ctx.fill();
      }

      // Draw logo
      if (uploadedLogo) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = uploadedLogo;
          });

          // Logo: 220px width, positioned with 48px top padding
          const logoHeight = (logoImg.height / logoImg.width) * 220;
          ctx.drawImage(logoImg, svgX + 50, svgY + 48, 220, logoHeight);
        } catch (error) {
          console.error('Error loading logo:', error);
          // Fallback to text logo
          ctx.fillStyle = 'white';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('🏊 headout', svgX + 50, svgY + 80);
        }
      } else {
        // Default text logo
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🏊 headout', svgX + 50, svgY + 80);
      }

      // Draw title (54px font size)
      ctx.fillStyle = 'white';
      ctx.font = 'bold 54px Arial';
      ctx.textAlign = 'left';
      
      const titleLines = title.split('\n');
      let titleY = svgY + 180;
      titleLines.forEach((line) => {
        ctx.fillText(line, svgX + 50, titleY);
        titleY += 65;
      });

      // Draw subtitle (34px font size)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '34px Arial';
      ctx.fillText(subtitle, svgX + 50, titleY + 20);

      // Draw CTA button (94px height, 12px border radius, black text, 34px font)
      const buttonX = svgX + 50;
      const buttonY = titleY + 80;
      const buttonWidth = 220;
      const buttonHeight = 94;
      const buttonRadius = 12;

      ctx.fillStyle = 'white';
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
      ctx.fill();

      // CTA text (34px font, black color)
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 34px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ctaText, buttonX + buttonWidth / 2, buttonY + 58);

      // Draw main image in designated area (100px from bottom, above CTA)
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

          // Create clipping path for image area
          ctx.save();
          ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
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
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            const handleSize = 20;
            const handleX = bounds.x + bounds.width - handleSize;
            const handleY = bounds.y + bounds.height - handleSize;
            
            ctx.fillRect(handleX, handleY, handleSize, handleSize);
            ctx.strokeRect(handleX, handleY, handleSize, handleSize);
            
            // Draw resize icon
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(handleX + 15, handleY + 5, 2, 10);
            ctx.fillRect(handleX + 5, handleY + 15, 10, 2);
          }
        } catch (error) {
          console.error('Error drawing main image:', error);
        }
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
    }, [title, subtitle, ctaText, uploadedImage, uploadedSvg, uploadedLogo, imageTransform]);

    return (
      <canvas
        ref={canvasRef}
        width={900}
        height={1600}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full h-auto cursor-pointer select-none"
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

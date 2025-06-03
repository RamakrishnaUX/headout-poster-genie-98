
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ImageCanvasProps {
  title: string;
  subtitle: string;
  ctaText: string;
  uploadedImage: string | null;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ title, subtitle, ctaText, uploadedImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
            img.onload = resolve;
            img.onerror = reject;
            img.src = uploadedImage;
          });

          const imageContainerX = cardX + 30;
          const imageContainerY = buttonY + 120;
          const imageContainerWidth = cardWidth - 60;
          const imageContainerHeight = cardHeight - (imageContainerY - cardY) - 30;
          const imageRadius = 30;

          // Create clipping path for rounded image
          ctx.save();
          drawRoundedRect(ctx, imageContainerX, imageContainerY, imageContainerWidth, imageContainerHeight, imageRadius);
          ctx.clip();

          // Calculate aspect ratio and draw image
          const imgAspectRatio = img.width / img.height;
          const containerAspectRatio = imageContainerWidth / imageContainerHeight;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container
            drawHeight = imageContainerHeight;
            drawWidth = drawHeight * imgAspectRatio;
            drawX = imageContainerX - (drawWidth - imageContainerWidth) / 2;
            drawY = imageContainerY;
          } else {
            // Image is taller than container
            drawWidth = imageContainerWidth;
            drawHeight = drawWidth / imgAspectRatio;
            drawX = imageContainerX;
            drawY = imageContainerY - (drawHeight - imageContainerHeight) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();
        } catch (error) {
          console.error('Error drawing main image:', error);
          // Draw placeholder
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          const imageContainerX = cardX + 30;
          const imageContainerY = buttonY + 120;
          const imageContainerWidth = cardWidth - 60;
          const imageContainerHeight = cardHeight - (imageContainerY - cardY) - 30;
          drawRoundedRect(ctx, imageContainerX, imageContainerY, imageContainerWidth, imageContainerHeight, 30);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Upload an image', imageContainerX + imageContainerWidth / 2, imageContainerY + imageContainerHeight / 2);
        }
      } else {
        // Draw placeholder for image
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        const imageContainerX = cardX + 30;
        const imageContainerY = buttonY + 120;
        const imageContainerWidth = cardWidth - 60;
        const imageContainerHeight = cardHeight - (imageContainerY - cardY) - 30;
        drawRoundedRect(ctx, imageContainerX, imageContainerY, imageContainerWidth, imageContainerHeight, 30);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image', imageContainerX + imageContainerWidth / 2, imageContainerY + imageContainerHeight / 2);
      }
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, 900, 1600);
      
      // Draw the card
      drawCard(ctx);
    }, [title, subtitle, ctaText, uploadedImage]);

    return (
      <canvas
        ref={canvasRef}
        width={900}
        height={1600}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full h-auto"
        style={{ maxWidth: '450px', height: 'auto' }}
      />
    );
  }
);

ImageCanvas.displayName = 'ImageCanvas';

export default ImageCanvas;

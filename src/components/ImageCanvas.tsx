import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';

interface ImageCanvasProps {
  title: string;
  subtitle: string;
  ctaText: string;
  uploadedImage: string | null;
  uploadedSvg: string | null;
  uploadedLogo: string | null;
  svgGradient: string;
  customGradientStart?: string;
  customGradientEnd?: string;
  format: '900x1600' | '1200x1200' | '1200x628';
}

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ title, subtitle, ctaText, uploadedImage, uploadedSvg, uploadedLogo, svgGradient, customGradientStart = '#a855f7', customGradientEnd = '#6b21a8', format }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageTransform, setImageTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    const getCanvasDimensions = () => {
      switch (format) {
        case '900x1600': return { width: 900, height: 1600 };
        case '1200x1200': return { width: 1200, height: 1200 };
        case '1200x628': return { width: 1200, height: 628 };
        default: return { width: 900, height: 1600 };
      }
    };

    const getLayoutConfig = () => {
      const { width, height } = getCanvasDimensions();
      
      switch (format) {
        case '900x1600':
          return {
            svgPadding: { x: 75, y: 100, width: 750, height: 1400 },
            logoPos: { x: 50, y: 48, width: 220 },
            titlePos: { x: 50, y: 180 },
            imageArea: { x: 130, y: 597, width: 640, height: 836 }
          };
        case '1200x1200':
          return {
            svgPadding: { x: 50, y: 50, width: 1100, height: 1100 },
            logoPos: { x: 50, y: 50, width: 220 },
            titlePos: { x: 650, y: 200 },
            imageArea: { x: 650, y: 350, width: 500, height: 700 }
          };
        case '1200x628':
          return {
            svgPadding: { x: 50, y: 50, width: 1100, height: 528 },
            logoPos: { x: 50, y: 50, width: 220 },
            titlePos: { x: 50, y: 200 },
            imageArea: { x: 650, y: 100, width: 500, height: 428 }
          };
        default:
          return {
            svgPadding: { x: 75, y: 100, width: 750, height: 1400 },
            logoPos: { x: 50, y: 48, width: 220 },
            titlePos: { x: 50, y: 180 },
            imageArea: { x: 130, y: 597, width: 640, height: 836 }
          };
      }
    };

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
      const layout = getLayoutConfig();
      return layout.imageArea;
    };

    const createMeshGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, type: string) => {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      switch (type) {
        case 'mesh-rainbow':
          // Create multiple radial gradients for mesh effect
          const gradient1 = ctx.createRadialGradient(x + width * 0.3, y + height * 0.3, 0, x + width * 0.3, y + height * 0.3, width * 0.5);
          gradient1.addColorStop(0, '#ff6b6b');
          gradient1.addColorStop(0.5, '#4ecdc4');
          gradient1.addColorStop(1, 'transparent');
          
          const gradient2 = ctx.createRadialGradient(x + width * 0.7, y + height * 0.7, 0, x + width * 0.7, y + height * 0.7, width * 0.5);
          gradient2.addColorStop(0, '#45b7d1');
          gradient2.addColorStop(0.5, '#f9ca24');
          gradient2.addColorStop(1, 'transparent');
          
          // Apply gradients with blend modes
          ctx.save();
          ctx.fillStyle = gradient1;
          ctx.fillRect(x, y, width, height);
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = gradient2;
          ctx.fillRect(x, y, width, height);
          ctx.restore();
          return null; // Already applied
          
        case 'mesh-sunset':
          const sunsetGradient = ctx.createRadialGradient(centerX, y + height * 0.2, 0, centerX, centerY, width * 0.8);
          sunsetGradient.addColorStop(0, '#ff9a56');
          sunsetGradient.addColorStop(0.3, '#ff6b9d');
          sunsetGradient.addColorStop(0.6, '#c44569');
          sunsetGradient.addColorStop(1, '#2d1b69');
          return sunsetGradient;
          
        case 'mesh-ocean':
          const oceanGradient = ctx.createRadialGradient(x + width * 0.2, y + width * 0.8, 0, centerX, centerY, width);
          oceanGradient.addColorStop(0, '#667eea');
          oceanGradient.addColorStop(0.4, '#764ba2');
          oceanGradient.addColorStop(0.7, '#f093fb');
          oceanGradient.addColorStop(1, '#f5576c');
          return oceanGradient;
          
        case 'mesh-aurora':
          const auroraGradient = ctx.createLinearGradient(x, y, x + width, y + height);
          auroraGradient.addColorStop(0, '#00c6ff');
          auroraGradient.addColorStop(0.25, '#0072ff');
          auroraGradient.addColorStop(0.5, '#fc00ff');
          auroraGradient.addColorStop(0.75, '#00dbde');
          auroraGradient.addColorStop(1, '#fc00ff');
          return auroraGradient;
          
        default:
          return null;
      }
    };

    const applySvgGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
      let gradient;
      
      // Check for mesh gradients first
      if (svgGradient.startsWith('mesh-')) {
        return createMeshGradient(ctx, x, y, width, height, svgGradient);
      }
      
      // Check for custom gradient
      if (svgGradient === 'custom') {
        gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, customGradientStart);
        gradient.addColorStop(1, customGradientEnd);
        return gradient;
      }
      
      switch (svgGradient) {
        case 'purple':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(0.5, '#7c3aed');
          gradient.addColorStop(1, '#6b21a8');
          break;
        case 'blue':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#60a5fa');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#1d4ed8');
          break;
        case 'green':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#34d399');
          gradient.addColorStop(0.5, '#10b981');
          gradient.addColorStop(1, '#047857');
          break;
        case 'orange':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#fb923c');
          gradient.addColorStop(0.5, '#f97316');
          gradient.addColorStop(1, '#c2410c');
          break;
        case 'pink':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#f472b6');
          gradient.addColorStop(0.5, '#ec4899');
          gradient.addColorStop(1, '#be185d');
          break;
        case 'teal':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#5eead4');
          gradient.addColorStop(0.5, '#14b8a6');
          gradient.addColorStop(1, '#0f766e');
          break;
        case 'indigo':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#818cf8');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#4338ca');
          break;
        case 'red':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#fb7185');
          gradient.addColorStop(0.5, '#f43f5e');
          gradient.addColorStop(1, '#be123c');
          break;
        case 'sunset':
          gradient = ctx.createLinearGradient(x, y, x + width, y + height);
          gradient.addColorStop(0, '#f97316');
          gradient.addColorStop(0.5, '#ec4899');
          gradient.addColorStop(1, '#8b5cf6');
          break;
        case 'ocean':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#1e40af');
          break;
        case 'yellow':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#fbbf24');
          gradient.addColorStop(0.5, '#f59e0b');
          gradient.addColorStop(1, '#d97706');
          break;
        case 'cyan':
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#22d3ee');
          gradient.addColorStop(0.5, '#06b6d4');
          gradient.addColorStop(1, '#0891b2');
          break;
        default:
          gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(0.5, '#7c3aed');
          gradient.addColorStop(1, '#6b21a8');
      }
      
      return gradient;
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
      const { width, height } = getCanvasDimensions();
      const layout = getLayoutConfig();

      // Draw blurred background image covering entire frame with transform applied
      if (uploadedImage) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
            bgImg.src = uploadedImage;
          });

          // Calculate dimensions with minimal scaling to avoid white edges
          const canvasAspect = width / height;
          const imageAspect = bgImg.width / bgImg.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imageAspect > canvasAspect) {
            // Image is wider, fit to height and crop width
            drawHeight = height;
            drawWidth = drawHeight * imageAspect;
            drawX = -(drawWidth - width) / 2;
            drawY = 0;
          } else {
            // Image is taller, fit to width and crop height
            drawWidth = width;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = -(drawHeight - height) / 2;
          }

          // Minimal scale to just cover canvas
          const scale = 1.02;
          drawWidth *= scale;
          drawHeight *= scale;
          drawX -= (drawWidth - width) / 2;
          drawY -= (drawHeight - height) / 2;

          // Apply transform to background (reduced effect - 20% of main image transform)
          const transformScale = 0.2;
          drawX += imageTransform.x * transformScale;
          drawY += imageTransform.y * transformScale;
          
          // Apply scale transform
          const scaleOffset = (imageTransform.scale - 1) * transformScale;
          drawWidth *= (1 + scaleOffset);
          drawHeight *= (1 + scaleOffset);
          drawX -= (drawWidth * scaleOffset) / 2;
          drawY -= (drawHeight * scaleOffset) / 2;

          ctx.filter = 'blur(15px) brightness(0.7)';
          ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);
          ctx.filter = 'none';
        } catch (error) {
          console.error('Error loading background image:', error);
          // Fallback to gradient background
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, '#60a5fa');
          gradient.addColorStop(1, '#3b82f6');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw main image in designated area BEFORE drawing SVG (so SVG appears on top)
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
        } catch (error) {
          console.error('Error drawing main image:', error);
        }
      }

      // Draw SVG background with padding (AFTER the main image so it appears on top)
      const { svgPadding } = layout;

      if (uploadedSvg) {
        try {
          const svgImg = new Image();
          svgImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            svgImg.onload = resolve;
            svgImg.onerror = reject;
            svgImg.src = uploadedSvg;
          });

          // Create a temporary canvas to apply gradient to SVG
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = svgPadding.width;
          tempCanvas.height = svgPadding.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            // Handle mesh gradients differently
            if (svgGradient.startsWith('mesh-')) {
              const meshResult = applySvgGradient(tempCtx, 0, 0, svgPadding.width, svgPadding.height);
              if (!meshResult) {
                // Mesh gradient was already applied
                tempCtx.globalCompositeOperation = 'destination-in';
                tempCtx.drawImage(svgImg, 0, 0, svgPadding.width, svgPadding.height);
                ctx.drawImage(tempCanvas, svgPadding.x, svgPadding.y);
              }
            } else {
              // Regular gradient
              const gradientFill = applySvgGradient(tempCtx, 0, 0, svgPadding.width, svgPadding.height);
              if (gradientFill) {
                tempCtx.fillStyle = gradientFill;
                tempCtx.fillRect(0, 0, svgPadding.width, svgPadding.height);
                
                // Apply SVG as mask
                tempCtx.globalCompositeOperation = 'destination-in';
                tempCtx.drawImage(svgImg, 0, 0, svgPadding.width, svgPadding.height);
                
                // Draw the result to main canvas
                ctx.drawImage(tempCanvas, svgPadding.x, svgPadding.y);
              }
            }
          }
        } catch (error) {
          console.error('Error loading SVG:', error);
          // Fallback to gradient with rounded rect
          const fallbackGradient = applySvgGradient(ctx, svgPadding.x, svgPadding.y, svgPadding.width, svgPadding.height);
          if (fallbackGradient) {
            ctx.fillStyle = fallbackGradient;
            drawRoundedRect(ctx, svgPadding.x, svgPadding.y, svgPadding.width, svgPadding.height, 40);
            ctx.fill();
          }
        }
      } else {
        // Default gradient background
        const defaultGradient = applySvgGradient(ctx, svgPadding.x, svgPadding.y, svgPadding.width, svgPadding.height);
        if (defaultGradient) {
          ctx.fillStyle = defaultGradient;
          drawRoundedRect(ctx, svgPadding.x, svgPadding.y, svgPadding.width, svgPadding.height, 40);
          ctx.fill();
        }
      }

      // Draw logo
      const { logoPos } = layout;
      if (uploadedLogo) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = uploadedLogo;
          });

          // Logo: 220px width, positioned with relative padding
          const logoHeight = (logoImg.height / logoImg.width) * logoPos.width;
          ctx.drawImage(logoImg, svgPadding.x + logoPos.x, svgPadding.y + logoPos.y, logoPos.width, logoHeight);
        } catch (error) {
          console.error('Error loading logo:', error);
          // Fallback to text logo
          ctx.fillStyle = 'white';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('🏊 headout', svgPadding.x + logoPos.x, svgPadding.y + logoPos.y + 36);
        }
      } else {
        // Default text logo
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🏊 headout', svgPadding.x + logoPos.x, svgPadding.y + logoPos.y + 36);
      }

      // Draw title with 650px width constraint (54px font size)
      const { titlePos } = layout;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 54px Arial';
      ctx.textAlign = 'left';
      
      const titleLines = title.split('\n');
      let titleY = svgPadding.y + titlePos.y;
      titleLines.forEach((line) => {
        // Wrap text to 650px width
        const words = line.split(' ');
        let currentLine = '';
        let testLine = '';
        
        for (let i = 0; i < words.length; i++) {
          testLine = currentLine + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > 650 && currentLine !== '') {
            ctx.fillText(currentLine.trim(), svgPadding.x + titlePos.x, titleY);
            titleY += 65;
            currentLine = words[i] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine.trim() !== '') {
          ctx.fillText(currentLine.trim(), svgPadding.x + titlePos.x, titleY);
          titleY += 65;
        }
      });

      // Draw subtitle with 650px width constraint and reduced spacing from title (34px font size, 1.4x line height, Lato font, 400 weight)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '400 34px "Lato", Arial, sans-serif';
      
      // Reduced spacing from title (was 8px, now -4px = 8-12)
      titleY -= 4;
      
      // Wrap subtitle text to 650px width with 1.4x line height
      const subtitleWords = subtitle.split(' ');
      let currentSubtitleLine = '';
      let testSubtitleLine = '';
      const subtitleLineHeight = 34 * 1.4; // 1.4x font size = 47.6px
      
      for (let i = 0; i < subtitleWords.length; i++) {
        testSubtitleLine = currentSubtitleLine + subtitleWords[i] + ' ';
        const metrics = ctx.measureText(testSubtitleLine);
        
        if (metrics.width > 650 && currentSubtitleLine !== '') {
          ctx.fillText(currentSubtitleLine.trim(), svgPadding.x + titlePos.x, titleY);
          titleY += subtitleLineHeight;
          currentSubtitleLine = subtitleWords[i] + ' ';
        } else {
          currentSubtitleLine = testSubtitleLine;
        }
      }
      
      if (currentSubtitleLine.trim() !== '') {
        ctx.fillText(currentSubtitleLine.trim(), svgPadding.x + titlePos.x, titleY);
        titleY += subtitleLineHeight;
      }

      // Draw CTA button with reduced spacing from subtitle (94px height, 20px border radius, Lato font, 500 weight)
      const buttonX = svgPadding.x + titlePos.x;
      const buttonY = titleY - 2; // Reduced spacing from subtitle by 6px (was 4px, now -2px = 4-6)
      const buttonWidth = 220;
      const buttonHeight = 94;
      const buttonRadius = 20;

      ctx.fillStyle = 'white';
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
      ctx.fill();

      // CTA text (34px font, black color, Lato font, 500 weight)
      ctx.fillStyle = '#000000';
      ctx.font = '500 34px "Lato", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ctaText, buttonX + buttonWidth / 2, buttonY + 58);

      // Draw resize handle when image is present
      if (imageLoaded && uploadedImage) {
        const bounds = getImageBounds();
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

      const { width, height } = getCanvasDimensions();
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw the card
      drawCard(ctx);
    }, [title, subtitle, ctaText, uploadedImage, uploadedSvg, uploadedLogo, imageTransform, svgGradient, customGradientStart, customGradientEnd, format]);

    const { width, height } = getCanvasDimensions();
    const maxDisplayWidth = format === '1200x628' ? 600 : 450;
    const displayHeight = format === '1200x628' ? (height * maxDisplayWidth) / width : 'auto';

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full h-auto cursor-pointer select-none"
        style={{ 
          maxWidth: `${maxDisplayWidth}px`, 
          height: displayHeight 
        }}
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

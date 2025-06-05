import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';

interface ImageCanvasProps {
  title: string;
  subtitle: string;
  ctaText: string;
  uploadedImage: string | null;
  uploadedLogo?: string | null;
  gradientAngle?: number;
  gradientColors?: string[];
  format: '900x1600' | '1200x1200' | '1200x628';
  hideControls?: boolean;
  enableGradient?: boolean;
  isDownloadMode?: boolean;
}

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

interface LayoutConfig {
  svgPadding: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  logoPos: {
    x: number;
    y: number;
    width: number;
  };
  titlePos: {
    x: number;
    y: number;
  };
  titleFontSize: number;
  subtitleFontSize: number;
  ctaFontSize: number;
  ctaHeight: number;
  imageArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  textMaxWidth: number;
  isDoubleLine?: boolean;
  ctaPos?: {
    x: number;
    y: number;
  };
  titleFontWeight: string;
  subtitleFontWeight: string;
  ctaFontWeight: string;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ title, subtitle, ctaText, uploadedImage, uploadedLogo, gradientAngle = 45, gradientColors = ['#a855f7', '#6b21a8'], format, hideControls = false, enableGradient = false, isDownloadMode = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageTransform, setImageTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isHoveringResizeHandle, setIsHoveringResizeHandle] = useState(false);
    const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);
    const defaultLogoPath = '/assets/headout-logo.svg';
    const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement | null>(null);
    const transformRef = useRef(imageTransform);
    const animationFrameRef = useRef<number>();

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    // Keep transform ref in sync with state
    useEffect(() => {
      transformRef.current = imageTransform;
    }, [imageTransform]);

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
            svgPadding: { x: 75, y: 100, width: 750, height: 1401 },
            logoPos: { x: 50, y: 48, width: 220 },
            titlePos: { x: 50, y: 180 },
            titleFontSize: 54,
            subtitleFontSize: 34,
            ctaFontSize: 34,
            ctaHeight: 94,
            imageArea: { x: 130, y: 597, width: 640, height: 836 },
            textMaxWidth: 650,
            titleFontWeight: '400',
            subtitleFontWeight: '300',
            ctaFontWeight: '400'
          } as LayoutConfig;
        case '1200x1200': {
          // Create a temporary canvas context to measure text
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.font = `400 50px HalyardDisplay, ui-sans-serif, system-ui, sans-serif`;
            
            // Calculate if text will wrap to multiple lines
            const words = title.split(' ');
            let currentLine = '';
            let lineCount = 1;
            
            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine + words[i] + ' ';
              const metrics = tempCtx.measureText(testLine);
              
              if (metrics.width > 650 && currentLine !== '') {
                lineCount++;
                currentLine = words[i] + ' ';
              } else {
                currentLine = testLine;
              }
            }

            // Return layout config based on line count
            const config: LayoutConfig = {
              svgPadding: { x: 73, y: 87, width: 1054, height: 1027 },
              logoPos: { x: 130, y: 140, width: 220 },
              titlePos: { x: 130, y: lineCount > 1 ? 940 : 1000 },
              titleFontSize: 50,
              subtitleFontSize: 34,
              ctaFontSize: 34,
              ctaHeight: 94,
              imageArea: { x: (width - 970) / 2, y: 134, width: 970, height: 764 },
              textMaxWidth: 650,
              isDoubleLine: lineCount > 1,
              titleFontWeight: '400',
              subtitleFontWeight: '300',
              ctaFontWeight: '400'
            };

            return {
              ...config,
              ctaPos: { 
                x: config.svgPadding.x + config.svgPadding.width - 50, 
                y: height - 144 - 90 
              }
            } as LayoutConfig;
          }
          // Fallback if context creation fails
          const fallbackConfig: LayoutConfig = {
            svgPadding: { x: 73, y: 87, width: 1054, height: 1027 },
            logoPos: { x: 130, y: 140, width: 220 },
            titlePos: { x: 130, y: 1000 },
            titleFontSize: 50,
            subtitleFontSize: 34,
            ctaFontSize: 34,
            ctaHeight: 94,
            imageArea: { x: (width - 970) / 2, y: 134, width: 970, height: 764 },
            textMaxWidth: 650,
            isDoubleLine: false,
            titleFontWeight: '400',
            subtitleFontWeight: '300',
            ctaFontWeight: '400'
          };

          return {
            ...fallbackConfig,
            ctaPos: { 
              x: fallbackConfig.svgPadding.x + fallbackConfig.svgPadding.width - 50, 
              y: height - 144 - 90 
            }
          } as LayoutConfig;
        }
        case '1200x628':
          return {
            svgPadding: { x: 54, y: 50, width: 1093, height: 520 },
            logoPos: { x: 50, y: 50, width: 220 },
            titlePos: { x: 50, y: 200 },
            titleFontSize: 44,
            subtitleFontSize: 28,
            ctaFontSize: 34,
            ctaHeight: 76,
            imageArea: { x: width - 100 - 510, y: 98, width: 510, height: 450 },
            textMaxWidth: 450,
            titleFontWeight: '400',
            subtitleFontWeight: '300',
            ctaFontWeight: '400'
          } as LayoutConfig;
        default:
          return {
            svgPadding: { x: 75, y: 100, width: 750, height: 1401 },
            logoPos: { x: 50, y: 48, width: 220 },
            titlePos: { x: 50, y: 180 },
            titleFontSize: 54,
            subtitleFontSize: 34,
            ctaFontSize: 34,
            ctaHeight: 94,
            imageArea: { x: 130, y: 597, width: 640, height: 836 },
            textMaxWidth: 650,
            titleFontWeight: '400',
            subtitleFontWeight: '300',
            ctaFontWeight: '400'
          } as LayoutConfig;
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

    const applySvgGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
      // Convert angle to radians and create directional gradient
      const angleRad = (gradientAngle * Math.PI) / 180;
      const x1 = x + width / 2 - Math.cos(angleRad) * width / 2;
      const y1 = y + height / 2 - Math.sin(angleRad) * height / 2;
      const x2 = x + width / 2 + Math.cos(angleRad) * width / 2;
      const y2 = y + height / 2 + Math.sin(angleRad) * height / 2;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      // Add multiple colors with equal spacing
      gradientColors.forEach((color, index) => {
        const position = index / (gradientColors.length - 1);
        gradient.addColorStop(position, color);
      });
      
      return gradient;
    };

    const isOverResizeHandle = (mouseX: number, mouseY: number) => {
      if (!uploadedImage || !imageLoaded) return false;
      
      const bounds = getImageBounds();
      const cornerThreshold = 30;
      
      return mouseX >= bounds.x + bounds.width - cornerThreshold && 
             mouseX <= bounds.x + bounds.width &&
             mouseY >= bounds.y + bounds.height - cornerThreshold &&
             mouseY <= bounds.y + bounds.height;
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
        
        if (isOverResizeHandle(mouseX, mouseY)) {
          setIsResizing(true);
        } else {
          setIsDragging(true);
        }
        
        dragStart.current = { x: mouseX, y: mouseY };
        event.preventDefault();
      }
    }, [uploadedImage, imageLoaded]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      // Update resize handle hover state
      if (!isDownloadMode && !isDragging && !isResizing) {
        setIsHoveringResizeHandle(isOverResizeHandle(mouseX, mouseY));
      }

      if (!isDragging && !isResizing) return;
      
      e.preventDefault();
      
      const x = mouseX;
      const y = mouseY;
      
      if (!dragStart.current) {
        dragStart.current = { x, y };
        return;
      }

      if (isResizing && imageRef.current) {
        const bounds = getImageBounds();
        const dx = x - dragStart.current.x;
        const dy = y - dragStart.current.y;
        
        let newScale = transformRef.current.scale;
        if (Math.abs(dx) > Math.abs(dy)) {
          const targetWidth = bounds.width + dx;
          newScale = targetWidth / bounds.width * transformRef.current.scale;
        } else {
          const targetHeight = bounds.height + dy;
          newScale = targetHeight / bounds.height * transformRef.current.scale;
        }
        
        newScale = Math.max(0.1, Math.min(5, newScale));
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          setImageTransform(prev => ({
            ...prev,
            scale: newScale
          }));
        });
      } else if (isDragging && imageRef.current) {
        const dx = x - dragStart.current.x;
        const dy = y - dragStart.current.y;
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          setImageTransform(prev => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy
          }));
        });
      }
      
      dragStart.current = { x, y };
    };

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setIsResizing(false);
      dragStart.current = { x: 0, y: 0 };
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }, []);

    const drawCard = async (ctx: CanvasRenderingContext2D) => {
      const { width, height } = getCanvasDimensions();
      const layout = getLayoutConfig();

      if (uploadedImage) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
            bgImg.src = uploadedImage;
          });

          const canvasAspect = width / height;
          const imageAspect = bgImg.width / bgImg.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imageAspect > canvasAspect) {
            drawHeight = height;
            drawWidth = drawHeight * imageAspect;
            drawX = -(drawWidth - width) / 2;
            drawY = 0;
          } else {
            drawWidth = width;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = -(drawHeight - height) / 2;
          }

          // Apply background image transformations
          const scale = 1.02;
          drawWidth *= scale;
          drawHeight *= scale;
          drawX -= (drawWidth - width) / 2;
          drawY -= (drawHeight - height) / 2;

          // Apply pan transformations to background
          const transformScale = 0.1; // Reduced from 0.2 to make background move less
          drawX += imageTransform.x * transformScale;
          drawY += imageTransform.y * transformScale;

          ctx.filter = 'blur(15px) brightness(0.7)';
          ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);
          ctx.filter = 'none';
        } catch (error) {
          console.error('Error loading background image:', error);
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, '#60a5fa');
          gradient.addColorStop(1, '#3b82f6');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      if (uploadedImage) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              setImageLoaded(img);
              imageRef.current = img;
              resolve(null);
            };
            img.onerror = reject;
            img.src = uploadedImage;
          });

          const bounds = getImageBounds();

          ctx.save();
          ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
          ctx.clip();

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

      const { svgPadding } = layout;

      // Add default SVG paths for each format
      const getDefaultSvgPath = () => {
        const layout = getLayoutConfig();
        switch (format) {
          case '900x1600':
            return '/assets/900x1600.svg';
          case '1200x1200':
            return layout.isDoubleLine ? '/assets/1200x1200_doubleline.svg' : '/assets/1200x1200.svg';
          case '1200x628':
            return '/assets/1200x628.svg';
          default:
            return '/assets/900x1600.svg';
        }
      };

      try {
        const svgImg = new Image();
        svgImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          svgImg.onload = resolve;
          svgImg.onerror = reject;
          svgImg.src = getDefaultSvgPath();
        });

        if (enableGradient) {
          // Apply gradient to SVG
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = svgPadding.width;
          tempCanvas.height = svgPadding.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            // Create gradient using custom colors and angle
            const angleRad = (gradientAngle * Math.PI) / 180;
            const x1 = svgPadding.width / 2 - Math.cos(angleRad) * svgPadding.width / 2;
            const y1 = svgPadding.height / 2 - Math.sin(angleRad) * svgPadding.height / 2;
            const x2 = svgPadding.width / 2 + Math.cos(angleRad) * svgPadding.width / 2;
            const y2 = svgPadding.height / 2 + Math.sin(angleRad) * svgPadding.height / 2;
            
            const gradient = tempCtx.createLinearGradient(x1, y1, x2, y2);
            
            // Add multiple colors with equal spacing
            gradientColors.forEach((color, index) => {
              const position = index / (gradientColors.length - 1);
              gradient.addColorStop(position, color);
            });
            
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(0, 0, svgPadding.width, svgPadding.height);
            
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(svgImg, 0, 0, svgPadding.width, svgPadding.height);
            
            ctx.drawImage(tempCanvas, svgPadding.x, svgPadding.y);
          }
        } else {
          // Draw SVG as is without gradient
          ctx.drawImage(svgImg, svgPadding.x, svgPadding.y, svgPadding.width, svgPadding.height);
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
        // Create fallback gradient
        const angleRad = (gradientAngle * Math.PI) / 180;
        const x1 = svgPadding.x + svgPadding.width / 2 - Math.cos(angleRad) * svgPadding.width / 2;
        const y1 = svgPadding.y + svgPadding.height / 2 - Math.sin(angleRad) * svgPadding.height / 2;
        const x2 = svgPadding.x + svgPadding.width / 2 + Math.cos(angleRad) * svgPadding.width / 2;
        const y2 = svgPadding.y + svgPadding.height / 2 + Math.sin(angleRad) * svgPadding.height / 2;
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradientColors.forEach((color, index) => {
          const position = index / (gradientColors.length - 1);
          gradient.addColorStop(position, color);
        });
        
        ctx.fillStyle = gradient;
        drawRoundedRect(ctx, svgPadding.x, svgPadding.y, svgPadding.width, svgPadding.height, 40);
        ctx.fill();
      }

      // Draw logo with improved quality
      const { logoPos } = layout;
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = defaultLogoPath;
        });

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const logoHeight = (logoImg.height / logoImg.width) * logoPos.width;
        
        // For 1200x1200, logo position is absolute, not relative to svgPadding
        const logoX = format === '1200x1200' ? logoPos.x : svgPadding.x + logoPos.x;
        const logoY = format === '1200x1200' ? logoPos.y : svgPadding.y + logoPos.y;
        
        ctx.drawImage(logoImg, logoX, logoY, logoPos.width, logoHeight);
      } catch (error) {
        console.error('Error loading logo:', error);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'left';
        
        const logoX = format === '1200x1200' ? logoPos.x : svgPadding.x + logoPos.x;
        const logoY = format === '1200x1200' ? logoPos.y + 36 : svgPadding.y + logoPos.y + 36;
        
        ctx.fillText('🏊 headout', logoX, logoY);
      }

      // Draw title with HalyardDisplay Regular
      const { titlePos, titleFontSize, textMaxWidth, titleFontWeight } = layout;
      ctx.fillStyle = 'white';
      ctx.font = `${titleFontWeight} ${titleFontSize}px HalyardDisplay, ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      
      const titleLines = title.split('\n');
      
      // For 1200x1200, title position is absolute, not relative to svgPadding
      const titleX = format === '1200x1200' ? titlePos.x : svgPadding.x + titlePos.x;
      let titleY = format === '1200x1200' ? titlePos.y : svgPadding.y + titlePos.y;
      
      titleLines.forEach((line) => {
        const words = line.split(' ');
        let currentLine = '';
        let testLine = '';
        
        for (let i = 0; i < words.length; i++) {
          testLine = currentLine + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > textMaxWidth && currentLine !== '') {
            ctx.fillText(currentLine.trim(), titleX, titleY);
            titleY += titleFontSize * 1.2;
            currentLine = words[i] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine.trim() !== '') {
          ctx.fillText(currentLine.trim(), titleX, titleY);
          titleY += titleFontSize * 1.2;
        }
      });

      // Draw subtitle with HalyardText Light
      const { subtitleFontSize, subtitleFontWeight } = layout;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `${subtitleFontWeight} ${subtitleFontSize}px HalyardText, ui-sans-serif, system-ui, sans-serif`;
      
      titleY -= 4;
      
      const subtitleWords = subtitle.split(' ');
      let currentSubtitleLine = '';
      let testSubtitleLine = '';
      const subtitleLineHeight = subtitleFontSize * 1.4;
      
      for (let i = 0; i < subtitleWords.length; i++) {
        testSubtitleLine = currentSubtitleLine + subtitleWords[i] + ' ';
        const metrics = ctx.measureText(testSubtitleLine);
        
        if (metrics.width > textMaxWidth && currentSubtitleLine !== '') {
          ctx.fillText(currentSubtitleLine.trim(), titleX, titleY);
          titleY += subtitleLineHeight;
          currentSubtitleLine = subtitleWords[i] + ' ';
        } else {
          currentSubtitleLine = testSubtitleLine;
        }
      }
      
      if (currentSubtitleLine.trim() !== '') {
        ctx.fillText(currentSubtitleLine.trim(), titleX, titleY);
        titleY += subtitleLineHeight;
      }

      // Draw CTA button with HalyardText Medium
      const { ctaHeight, ctaFontSize, ctaFontWeight } = layout;
      
      // Calculate CTA button width based on text
      ctx.font = `${ctaFontWeight} ${ctaFontSize}px HalyardText, ui-sans-serif, system-ui, sans-serif`;
      const ctaMetrics = ctx.measureText(ctaText);
      let calculatedCtaWidth = Math.ceil(ctaMetrics.width + 48); // Add padding
      
      // Apply format-specific constraints
      let ctaWidth;
      if (format === '1200x1200') {
        ctaWidth = Math.min(240, calculatedCtaWidth); // Max 240px for 1200x1200
      } else {
        ctaWidth = calculatedCtaWidth; // Dynamic width for other formats
      }
      
      let buttonX, buttonY;
      if (format === '1200x1200' && layout.ctaPos) {
        buttonX = layout.ctaPos.x - ctaWidth; // Right align by subtracting width
        buttonY = layout.ctaPos.y;
      } else {
        buttonX = titleX;
        buttonY = titleY - 2;
      }
      
      const buttonRadius = 20;

      ctx.fillStyle = 'white';
      drawRoundedRect(ctx, buttonX, buttonY, ctaWidth, ctaHeight, buttonRadius);
      ctx.fill();

      // CTA text with HalyardText Regular
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `${ctaFontWeight} ${ctaFontSize}px HalyardText, ui-sans-serif, system-ui, sans-serif`;
      ctx.fillText(ctaText, buttonX + ctaWidth / 2, buttonY + ctaHeight / 2 + ctaFontSize / 3);

      // Draw invisible resize handle if not in download mode and image is loaded
      if (!isDownloadMode && imageLoaded && uploadedImage) {
        const bounds = getImageBounds();
        const handleSize = 20;
        const handleX = bounds.x + bounds.width - handleSize;
        const handleY = bounds.y + bounds.height - handleSize;
        
        // Set fully transparent fill for the handle area
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(handleX, handleY, handleSize, handleSize);
      }
    };

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

      ctx.clearRect(0, 0, width, height);
      
      drawCard(ctx);
    }, [title, subtitle, ctaText, uploadedImage, imageTransform, gradientAngle, gradientColors, format]);

    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    const { width, height } = getCanvasDimensions();
    const maxDisplayWidth = format === '1200x628' ? 600 : 450;
    const displayHeight = format === '1200x628' ? (height * maxDisplayWidth) / width : 'auto';

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg shadow-lg max-w-full h-auto select-none"
        style={{ 
          maxWidth: `${maxDisplayWidth}px`, 
          height: displayHeight,
          cursor: isHoveringResizeHandle ? 'se-resize' : isDragging ? 'move' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={(e) => {
          handleMouseUp();
          setIsHoveringResizeHandle(false);
        }}
      />
    );
  }
);

ImageCanvas.displayName = 'ImageCanvas';

export default ImageCanvas;

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Plus, Minus, Archive } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageCanvas from '@/components/ImageCanvas';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import '@/styles/fonts.css';

const Index = () => {
  const [title, setTitle] = useState('16 Water Attractions\nOne Epic Splash Day.');
  const [subtitle, setSubtitle] = useState('Caribe Aquatic Park from €29!');
  const [ctaText, setCtaText] = useState('Book now');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'900x1600' | '1200x1200' | '1200x628'>('900x1600');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState(['#a855f7', '#6b21a8']);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef900x1600 = useRef<HTMLCanvasElement>(null);
  const canvasRef1200x1200 = useRef<HTMLCanvasElement>(null);
  const canvasRef1200x628 = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const getCurrentCanvasRef = () => {
    switch (selectedFormat) {
      case '900x1600': return canvasRef900x1600;
      case '1200x1200': return canvasRef1200x1200;
      case '1200x628': return canvasRef1200x628;
      default: return canvasRef900x1600;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = getCurrentCanvasRef().current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `promotional-image-${selectedFormat}.${downloadFormat}`;
      const quality = downloadFormat === 'jpeg' ? 0.95 : undefined;
      link.href = canvas.toDataURL(`image/${downloadFormat}`, quality);
      link.click();
      toast({
        title: "Image Downloaded",
        description: `Your ${selectedFormat} promotional image has been saved successfully!`,
      });
    }
  };

  const handleBulkDownload = async () => {
    const zip = new JSZip();
    const formats: Array<'900x1600' | '1200x1200' | '1200x628'> = ['900x1600', '1200x1200', '1200x628'];
    const canvasRefs = {
      '900x1600': canvasRef900x1600,
      '1200x1200': canvasRef1200x1200,
      '1200x628': canvasRef1200x628
    };

    try {
      // Create a folder in the zip for the images
      const imagesFolder = zip.folder("headout-posters");
      if (!imagesFolder) throw new Error("Could not create zip folder");

      // Add each format to the zip
      for (const format of formats) {
        const canvas = canvasRefs[format].current;
        if (!canvas) continue;

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, `image/${downloadFormat}`, downloadFormat === 'jpeg' ? 0.9 : undefined);
        });

        // Add to zip
        imagesFolder.file(`headout-poster-${format}.${downloadFormat}`, blob);
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `headout-posters.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "All formats have been downloaded as a ZIP file.",
      });
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast({
        title: "Error",
        description: "Failed to create ZIP file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Promotional image generator
          </h1>
          <p className="text-gray-600 text-lg">
            Create stunning promotional graphics with custom content and images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Content Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label>Asset Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setSelectedFormat('900x1600')}
                    variant={selectedFormat === '900x1600' ? 'default' : 'outline'}
                    size="sm"
                  >
                    900×1600
                  </Button>
                  <Button
                    onClick={() => setSelectedFormat('1200x1200')}
                    variant={selectedFormat === '1200x1200' ? 'default' : 'outline'}
                    size="sm"
                  >
                    1200×1200
                  </Button>
                  <Button
                    onClick={() => setSelectedFormat('1200x628')}
                    variant={selectedFormat === '1200x628' ? 'default' : 'outline'}
                    size="sm"
                  >
                    1200×628
                  </Button>
                </div>
              </div>

              {/* Download Format Selection */}
              <div className="space-y-2">
                <Label>Download Format</Label>
                <Select value={downloadFormat} onValueChange={(value: 'png' | 'jpeg') => setDownloadFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                    <SelectItem value="jpeg">JPEG (Smaller file)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Textarea
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your main title"
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Enter your subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta">Call-to-Action Text</Label>
                <Input
                  id="cta"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Enter CTA text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Upload Logo</Label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Logo
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                {uploadedLogo && (
                  <p className="text-sm text-green-600">✓ Logo uploaded successfully</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>SVG Background Gradient</Label>
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  {/* Gradient Angle */}
                  <div className="space-y-2">
                    <Label className="text-xs">Gradient Angle: {gradientAngle}°</Label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Gradient Colors */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Colors</Label>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => {
                            if (gradientColors.length < 5) {
                              setGradientColors([...gradientColors, '#8b5cf6']);
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          disabled={gradientColors.length >= 5}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (gradientColors.length > 2) {
                              setGradientColors(gradientColors.slice(0, -1));
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          disabled={gradientColors.length <= 2}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {gradientColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            className="text-xs flex-1"
                            placeholder="#a855f7"
                          />
                          {gradientColors.length > 2 && (
                            <Button
                              onClick={() => {
                                if (gradientColors.length > 2) {
                                  setGradientColors(gradientColors.filter((_, i) => i !== index));
                                }
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {uploadedImage && (
                  <div className="text-sm space-y-1">
                    <p className="text-green-600">✓ Image uploaded successfully</p>
                    <p className="text-gray-600">💡 Drag to move, use bottom-right handle to resize</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {selectedFormat} Image
                </Button>
                
                <Button
                  onClick={handleBulkDownload}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Download All 3 Formats
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview ({selectedFormat})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative">
                  {/* Hidden canvases for other formats */}
                  <div className="hidden">
                    {selectedFormat !== '900x1600' && (
                      <ImageCanvas
                        ref={canvasRef900x1600}
                        title={title}
                        subtitle={subtitle}
                        ctaText={ctaText}
                        uploadedImage={uploadedImage}
                        uploadedLogo={uploadedLogo}
                        gradientAngle={gradientAngle}
                        gradientColors={gradientColors}
                        format="900x1600"
                        hideControls={true}
                      />
                    )}
                    {selectedFormat !== '1200x1200' && (
                      <ImageCanvas
                        ref={canvasRef1200x1200}
                        title={title}
                        subtitle={subtitle}
                        ctaText={ctaText}
                        uploadedImage={uploadedImage}
                        uploadedLogo={uploadedLogo}
                        gradientAngle={gradientAngle}
                        gradientColors={gradientColors}
                        format="1200x1200"
                        hideControls={true}
                      />
                    )}
                    {selectedFormat !== '1200x628' && (
                      <ImageCanvas
                        ref={canvasRef1200x628}
                        title={title}
                        subtitle={subtitle}
                        ctaText={ctaText}
                        uploadedImage={uploadedImage}
                        uploadedLogo={uploadedLogo}
                        gradientAngle={gradientAngle}
                        gradientColors={gradientColors}
                        format="1200x628"
                        hideControls={true}
                      />
                    )}
                  </div>

                  {/* Live preview canvas */}
                  <ImageCanvas
                    ref={getCurrentCanvasRef()}
                    title={title}
                    subtitle={subtitle}
                    ctaText={ctaText}
                    uploadedImage={uploadedImage}
                    uploadedLogo={uploadedLogo}
                    gradientAngle={gradientAngle}
                    gradientColors={gradientColors}
                    format={selectedFormat}
                    hideControls={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

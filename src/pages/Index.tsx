import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download } from 'lucide-react';
import ImageCanvas from '@/components/ImageCanvas';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [title, setTitle] = useState('16 Water Attractions\nOne Epic Splash Day.');
  const [subtitle, setSubtitle] = useState('Caribe Aquatic Park from €29!');
  const [ctaText, setCtaText] = useState('Book now');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedSvg, setUploadedSvg] = useState<string | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [svgGradient, setSvgGradient] = useState('purple');
  const [customGradientStart, setCustomGradientStart] = useState('#a855f7');
  const [customGradientEnd, setCustomGradientEnd] = useState('#6b21a8');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

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

  const handleSvgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedSvg(e.target?.result as string);
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
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'promotional-image.png';
      link.href = canvas.toDataURL();
      link.click();
      toast({
        title: "Image Downloaded",
        description: "Your promotional image has been saved successfully!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Promotional Image Generator
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
                <Label htmlFor="svg">Upload SVG Background</Label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => svgInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose SVG
                  </Button>
                  <input
                    ref={svgInputRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleSvgUpload}
                    className="hidden"
                  />
                </div>
                {uploadedSvg && (
                  <p className="text-sm text-green-600">✓ SVG uploaded successfully</p>
                )}
                
                {/* SVG Gradient Options */}
                <div className="space-y-4">
                  <Label>SVG Gradient (when no SVG uploaded)</Label>
                  
                  {/* Basic Gradients - 6 per row, total 12 colors */}
                  <div className="grid grid-cols-6 gap-2">
                    <Button
                      onClick={() => setSvgGradient('purple')}
                      variant={svgGradient === 'purple' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-purple-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('blue')}
                      variant={svgGradient === 'blue' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('green')}
                      variant={svgGradient === 'green' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-green-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('orange')}
                      variant={svgGradient === 'orange' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-orange-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('pink')}
                      variant={svgGradient === 'pink' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-pink-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('teal')}
                      variant={svgGradient === 'teal' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-teal-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('indigo')}
                      variant={svgGradient === 'indigo' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('red')}
                      variant={svgGradient === 'red' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-red-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('yellow')}
                      variant={svgGradient === 'yellow' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-yellow-500 to-yellow-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('cyan')}
                      variant={svgGradient === 'cyan' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-700 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('sunset')}
                      variant={svgGradient === 'sunset' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 h-8"
                    />
                    <Button
                      onClick={() => setSvgGradient('ocean')}
                      variant={svgGradient === 'ocean' ? 'default' : 'outline'}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-8"
                    />
                  </div>

                  {/* Custom Gradient */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSvgGradient('custom')}
                        variant={svgGradient === 'custom' ? 'default' : 'outline'}
                        size="sm"
                      >
                        Custom
                      </Button>
                      <Label className="text-sm">Custom Colors</Label>
                    </div>
                    
                    {svgGradient === 'custom' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Start Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={customGradientStart}
                              onChange={(e) => setCustomGradientStart(e.target.value)}
                              className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <Input
                              value={customGradientStart}
                              onChange={(e) => setCustomGradientStart(e.target.value)}
                              className="text-xs"
                              placeholder="#a855f7"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">End Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={customGradientEnd}
                              onChange={(e) => setCustomGradientEnd(e.target.value)}
                              className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <Input
                              value={customGradientEnd}
                              onChange={(e) => setCustomGradientEnd(e.target.value)}
                              className="text-xs"
                              placeholder="#6b21a8"
                            />
                          </div>
                        </div>
                      </div>
                    )}
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

              <Button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative">
                  <ImageCanvas
                    ref={canvasRef}
                    title={title}
                    subtitle={subtitle}
                    ctaText={ctaText}
                    uploadedImage={uploadedImage}
                    uploadedSvg={uploadedSvg}
                    uploadedLogo={uploadedLogo}
                    svgGradient={svgGradient}
                    customGradientStart={customGradientStart}
                    customGradientEnd={customGradientEnd}
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

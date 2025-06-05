import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tourNumber } = req.query;

  if (!tourNumber) {
    return res.status(400).json({ message: 'Tour number is required' });
  }

  try {
    const response = await fetch(`https://headout.com/tour/${tourNumber}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      throw new Error('Failed to fetch tour page');
    }

    const html = await response.text();
    
    // Extract image URLs using regex
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const images: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const imageUrl = match[1];
      // Filter out small icons, logos, etc.
      if (imageUrl.includes('cloudfront.net') || imageUrl.includes('headout-media')) {
        images.push(imageUrl);
      }
    }

    // Remove duplicates
    const uniqueImages = [...new Set(images)];

    return res.status(200).json({ images: uniqueImages });
  } catch (error) {
    console.error('Error fetching tour images:', error);
    return res.status(500).json({ message: 'Failed to fetch tour images' });
  }
} 

import type React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, imageSrc, imageAlt, dataAiHint }) => {
  return (
    <Card className="group shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 flex flex-col h-full overflow-hidden">
      <CardHeader className="items-center text-center">
        <div className="mb-4 p-3 bg-primary/10 rounded-full">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow items-center text-center">
        <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
        <div className="mt-auto w-full aspect-[3/2] relative overflow-hidden rounded-md">
           <Image 
            src={imageSrc} 
            alt={imageAlt} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out"
            data-ai-hint={dataAiHint}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;


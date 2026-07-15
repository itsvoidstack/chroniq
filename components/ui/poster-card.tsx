import React from 'react';
import Image from 'next/image';
import { FavoriteButton } from './FavoriteButton';

interface PosterCardProps {
  id: number;
  title: string;
  posterUrl: string;
  type: 'anime' | 'movie' | 'tv';
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  id,
  title,
  posterUrl,
  type,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      className="poster-card flex flex-col gap-2 cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
        {onToggleFavorite && (
          <div className="absolute top-2 right-2">
            <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
          </div>
        )}
      </div>
      <p className="text-sm font-medium line-clamp-2">{title}</p>
    </div>
  );
};
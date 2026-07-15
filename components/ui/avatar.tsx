import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
}) => {
  return (
    <div>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={40}
          height={40}
        />
      ) : (
        <div>
          {name[0]}
        </div>
      )}
    </div>
  );
};

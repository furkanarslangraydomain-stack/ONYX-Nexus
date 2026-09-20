import React, { useState } from 'react';
import { RenderStudio3D } from './RenderStudio3D';

export const ThreeDStudioPanel: React.FC = () => {
  return (
    <div className="w-full h-full">
      <RenderStudio3D />
    </div>
  );
};

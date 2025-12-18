"use client";
import { Suspense } from 'react';
import PropertiesContent from './PropertiesContent';

const Properties = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesContent />
    </Suspense>
  );
};

export default Properties;
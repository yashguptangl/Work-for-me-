declare module "next/image" {
  import { ComponentType } from "react";
  
  interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    unoptimized?: boolean;
    sizes?: string;
    style?: React.CSSProperties;
  }
  
  const Image: ComponentType<ImageProps>;
  export default Image;
}

declare module "next/link" {
  import { ComponentType, ReactNode } from "react";
  
  interface LinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    target?: string;
    rel?: string;
  }
  
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}
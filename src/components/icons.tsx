import type { SVGProps } from "react";
import Image from "next/image";

export function BniIcon(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src="/images/bni-logo.png"
      alt="BNI Logo"
      width={500}
      height={170}
      priority
      {...props}
    />
  );
}

export function GojekIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" {...props}>
      <circle cx="512" cy="512" r="448" fill="#00AA13"/>
      <path d="M512 256a256 256 0 0 1 0 512V256z" fill="#fff"/>
    </svg>
  );
}

export function OvoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" {...props}>
        <circle cx="512" cy="512" r="448" fill="#4D2A86"/>
        <path d="M542.4 689.92h-60.8l-12.8-54.4h-99.2l-12.8 54.4h-60.8l116.8-291.2h75.2l118.4 291.2zm-125.6-96l-32-132.8-32.8 132.8h64.8zM688 640c0 41.6-16 76.8-42.4 102.4-26.4 26.4-62.4 39.2-102.4 39.2s-76-12.8-102.4-39.2c-26.4-25.6-42.4-60.8-42.4-102.4 0-41.6 16-76.8 42.4-102.4 26.4-26.4 62.4-39.2 102.4-39.2s76 12.8 102.4 39.2c26.4 26.4 42.4 61.6 42.4 102.4zm-64.8 0c0-29.6-10.4-53.6-31.2-72.8-20.8-18.4-46.4-28-72.8-28s-52 9.6-72.8 28c-20.8 19.2-31.2 43.2-31.2 72.8s10.4 53.6 31.2 72.8c20.8 18.4 46.4 28 72.8 28s52-9.6 72.8-28c20.8-19.2 31.2-43.2 31.2-72.8z" fill="#fff"/>
    </svg>
  );
}

export function ShopeePayIcon(props: SVGProps<SVGSVGElement>) {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" {...props}>
        <path d="M832 640V384H192v256H32v128h960V640H832zM192 128h640v128H192V128z" fill="#EE4D2D"/>
        <path d="M512 576a64 64 0 1 0 0-128 64 64 0 0 0 0 128z" fill="#EE4D2D"/>
      </svg>
  );
}

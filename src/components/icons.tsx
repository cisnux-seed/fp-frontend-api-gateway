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

export function ShopeePayIcon(props: SVGProps<SVGSVGElement>) {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" {...props}>
        <path d="M832 640V384H192v256H32v128h960V640H832zM192 128h640v128H192V128z" fill="#EE4D2D"/>
        <path d="M512 576a64 64 0 1 0 0-128 64 64 0 0 0 0 128z" fill="#EE4D2D"/>
      </svg>
  );
}

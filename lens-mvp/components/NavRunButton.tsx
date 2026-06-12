'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavRunButton() {
  const pathname = usePathname();
  if (pathname === '/search') return null;
  return (
    <Link href="/search" className="btn btn-primary">
      Run The Lens™
    </Link>
  );
}

import { redirect } from 'next/navigation';

// Permanent redirect: /enterprise/pe-stack → /enterprise/investor-stack
export default function PeStackRedirect() {
  redirect('/enterprise/investor-stack');
}

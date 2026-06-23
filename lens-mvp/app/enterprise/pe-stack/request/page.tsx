import { redirect } from 'next/navigation';

// Permanent redirect: /enterprise/pe-stack/request → /enterprise/investor-stack/request
export default function PeStackRequestRedirect() {
  redirect('/enterprise/investor-stack/request');
}

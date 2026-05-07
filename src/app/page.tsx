import { redirect } from 'next/navigation';

/**
 * Root page — redirects to the public landing page.
 * The landing page lives at (public)/ → handled by (public) route group.
 */
export default function RootPage() {
  redirect('/home');
}
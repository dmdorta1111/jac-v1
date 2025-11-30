import { redirect } from 'next/navigation';

export default function QuotePage() {
  // ProjectQuoteForm was removed - redirect to main chat
  redirect('/');
}

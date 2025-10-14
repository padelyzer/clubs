import { redirect } from 'next/navigation'

// This route has been deprecated in favor of /dashboard/classes
// which uses a modular component architecture
export default function ClassesRedirect() {
  redirect('/dashboard/classes')
}

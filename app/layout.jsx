import './globals.css';
import { AuthProvider } from '@/app/hooks/useAuth';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3f3fc4',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';
import { AuthProvider } from '@/lib/authContext';

export const metadata = {
  title: 'WebZero LMS - Learning Management System',
  description: 'A modern learning management platform for courses, lessons, and assessments. Built with Next.js and Firebase.',
  keywords: 'LMS, learning, courses, education, assessments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <div className="page-wrapper">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

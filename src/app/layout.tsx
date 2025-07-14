import type { Metadata } from 'next';
import { Provider as ThemeProvider } from '@/components/ui/ThemeProvider';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Sample Interview Project',
    authors: [{ name: 'Mero' }],
    creator: 'Mero',
    description: 'Dummy application for interview purposes',
};

export default function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}

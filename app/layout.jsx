import './globals.css';

export const metadata = {
  title: {
    default: 'BI AI Dashboard — Stock Sentiment & Recommendations',
    template: '%s | BI AI Dashboard',
  },
  description: 'Analisis sentimen pasar saham berbasis AI menggunakan FinBERT dan Yahoo Finance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('bi_theme');
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="min-h-screen pb-12">{children}</div>
      </body>
    </html>
  );
}

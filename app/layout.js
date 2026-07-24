import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Diamond Nursery",
  description: "Mobile-first nursery storefront homepage"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="desktop-blocker">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📱</div>
          <h2>Please open this website on a mobile phone</h2>
          <p style={{ marginTop: '20px', color: '#666' }}>Crafted by <strong>ShonkuWeb</strong></p>
        </div>
        <div className="mobile-app-container">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

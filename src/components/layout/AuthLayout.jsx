// src/components/layout/AuthLayout.jsx

import authBgImage from "@/assets/images/auth-image.jpg";

// Ana layout container'ı (değişiklik yok)
export function AuthLayout({ children }) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {children}
    </div>
  );
}

// Görseli ve metni içeren sol panel (TÜM DEĞİŞİKLİKLER BURADA)
export function AuthImage() {
  return (
    <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
      {/* 1. Arka Plan Resmi */}
      <div
        className="absolute inset-0 bg-cover bg-center" // `bg-center` ekleyerek resmi ortalıyoruz
        style={{ backgroundImage: `url(${authBgImage})` }}
      />

      {/* 
        2. YARI ŞEFFAF GRADIENT KATMANI (Overlay)
        Bu, sorunun ana çözümüdür. Alttan yukarıya doğru siyah ve şeffaf bir
        geçiş oluşturarak, alttaki metnin arka planını koyulaştırır ve okunurluğu artırır.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* 
        3. İÇERİK (Logo ve Alıntı)
        Bu div, `z-20` ile gradient katmanının üzerine çıkar.
      */}
      <div className="relative z-20 flex h-full flex-col justify-between">
        {/* Logo Alanı */}
        <div className="flex items-center text-lg font-medium">
          {/* Logo metni veya görseli buraya gelebilir */}
          GoFormed
        </div>

        {/* Alıntı Alanı (Sayfanın en altında) */}
        <div>
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              “This service has been a true game-changer for our international
              operations. Seamless and efficient.”
            </p>
            <footer className="text-sm font-light text-white/80">
              Sofia Davis, Global Entrepreneur
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

// Sağdaki içerik paneli (değişiklik yok)
export function AuthContent({ children }) {
  return <div className="lg:p-8">{children}</div>;
}

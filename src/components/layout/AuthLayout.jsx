import authBgImage from "@/assets/images/auth-image.jpg";

export function AuthLayout({ children }) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {children}
    </div>
  );
}

export function AuthImage() {
  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: `url(${authBgImage})` }}
      />
      <div className="relative z-20 flex items-center text-lg font-medium">
        {/* Logo buraya gelebilir */}
        GoFormed
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            “This service has been a true game-changer for our international
            operations. Seamless and efficient.”
          </p>
          <footer className="text-sm">Sofia Davis</footer>
        </blockquote>
      </div>
    </div>
  );
}

export function AuthContent({ children }) {
  return <div className="lg:p-8">{children}</div>;
}

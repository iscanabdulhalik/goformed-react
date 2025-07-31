import React, { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Supabase client'ınızın doğru yolda olduğundan emin olun
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Temayı bozmamak için, yükleme durumunu basitçe yönetebiliriz
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function SettingsPage() {
  // --- STATE YÖNETİMİ ---
  const [loading, setLoading] = useState(true);
  // Hata ve başarı mesajlarını ayrı ayrı yönetelim
  const [messages, setMessages] = useState({
    profileError: null,
    profileSuccess: null,
    passwordError: null,
    passwordSuccess: null,
  });

  // Form alanları için state'ler
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Şifre alanları için state'ler
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- VERİ ÇEKME (useEffect) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Kullanıcı oturumu bulunamadı.");

        setEmail(user.email);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (profile) {
          // 'full_name' alanını ad ve soyad olarak ayıralım
          const nameParts = profile.full_name?.split(" ") || ["", ""];
          setFirstName(nameParts[0]);
          setLastName(nameParts.slice(1).join(" "));
          // `profiles` tablonuzda 'phone' adında bir sütun varsa burayı kullanabilirsiniz
          // setPhone(profile.phone || "");
        }
      } catch (error) {
        setMessages((prev) => ({ ...prev, profileError: error.message }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // --- PROFİL GÜNCELLEME FONKSİYONU ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages({ profileError: null, profileSuccess: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı.");

      const fullName = `${firstName} ${lastName}`.trim();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          // phone: phone, // Telefonu da güncellemek için
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessages((prev) => ({
        ...prev,
        profileSuccess: "Bilgiler başarıyla güncellendi!",
      }));
    } catch (error) {
      setMessages((prev) => ({ ...prev, profileError: error.message }));
    } finally {
      setLoading(false);
    }
  };

  // --- ŞİFRE GÜNCELLEME FONKSİYONU ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages({ passwordError: null, passwordSuccess: null });

    if (newPassword !== confirmPassword) {
      setMessages((prev) => ({
        ...prev,
        passwordError: "Yeni şifreler eşleşmiyor.",
      }));
      setLoading(false);
      return;
    }
    if (!newPassword) {
      setMessages((prev) => ({
        ...prev,
        passwordError: "Yeni şifre alanı boş bırakılamaz.",
      }));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setMessages((prev) => ({
        ...prev,
        passwordSuccess: "Şifre başarıyla güncellendi!",
      }));
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessages((prev) => ({ ...prev, passwordError: error.message }));
    } finally {
      setLoading(false);
    }
  };

  // Eğer veriler hala yükleniyorsa, bir yükleme göstergesi göster
  if (loading && !email) {
    return <LoadingSpinner />;
  }

  // --- JSX (GÖRÜNÜM) ---
  // Orijinal yapınız hiç değiştirilmeden, sadece state'ler ile dinamik hale getirildi.
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and password settings.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+90 555 555 5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            {messages.profileSuccess && (
              <p className="text-sm text-green-600">
                {messages.profileSuccess}
              </p>
            )}
            {messages.profileError && (
              <p className="text-sm text-red-600">{messages.profileError}</p>
            )}
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handleUpdatePassword}>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password. Please enter your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Eski şifre alanı güvenlik nedeniyle genellikle önerilmez, Supabase doğrudan güncellemeye izin verir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
            {messages.passwordSuccess && (
              <p className="text-sm text-green-600">
                {messages.passwordSuccess}
              </p>
            )}
            {messages.passwordError && (
              <p className="text-sm text-red-600">{messages.passwordError}</p>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

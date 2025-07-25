// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import Button from "../components/common/Button";
import {
  AuthLayout,
  ImageColumn,
  ImageContainer, // GÜNCELLENDİ: Yeni bileşeni import et
  FormColumn,
  AuthCard,
  Form,
  Input,
  OrSeparator,
  FinePrint,
  ErrorMessage,
} from "./AuthStyles";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign in with Google.");
      console.error(err);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 },
  };

  const pageTransition = {
    duration: 0.5,
    ease: "easeInOut",
  };

  return (
    <AuthLayout>
      <ImageColumn>
        {/* GÜNCELLENDİ: Animasyon dairesel görselin kendisine uygulandı */}
        <ImageContainer
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        />
      </ImageColumn>
      <FormColumn
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ ...pageTransition, delay: 0.2 }}
      >
        <AuthCard>
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in.</p>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleEmailLogin}>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" $primary style={{ width: "100%" }}>
              Sign In
            </Button>
          </Form>

          <OrSeparator>OR</OrSeparator>

          <Button
            onClick={handleGoogleLogin}
            $secondary
            style={{ width: "100%" }}
          >
            Sign In with Google
          </Button>

          <FinePrint>
            Don't have an account? <Link to="/register">Sign up</Link>
          </FinePrint>
        </AuthCard>
      </FormColumn>
    </AuthLayout>
  );
};

export default LoginPage;

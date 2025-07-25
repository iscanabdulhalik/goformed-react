// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import Button from "../components/common/Button";
import {
  AuthLayout,
  ImageColumn,
  FormColumn,
  AuthCard,
  Form,
  Input,
  OrSeparator,
  FinePrint,
  ErrorMessage,
} from "./AuthStyles";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create an account. The email may already be in use.");
      console.error(err);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign up with Google.");
      console.error(err);
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    duration: 0.7,
    ease: "easeInOut",
  };

  return (
    <AuthLayout>
      <ImageColumn
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      />
      <FormColumn
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <AuthCard>
          <h1>Create an Account</h1>
          <p>Start your journey with us today.</p>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleEmailRegister}>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" $primary style={{ width: "100%" }}>
              Create Account
            </Button>
          </Form>

          <OrSeparator>OR</OrSeparator>

          <Button
            onClick={handleGoogleRegister}
            $secondary
            style={{ width: "100%" }}
          >
            Sign Up with Google
          </Button>

          <FinePrint>
            Already have an account? <Link to="/login">Sign In</Link>
          </FinePrint>
        </AuthCard>
      </FormColumn>
    </AuthLayout>
  );
};

export default RegisterPage;

// src/pages/AuthStyles.js
import styled from "styled-components";
import { motion } from "framer-motion";

export const AuthLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background-color: #fff;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const ImageColumn = styled(motion.div)`
  background: url("https://images.unsplash.com/photo-1559163499-4138189d26aa?q=80&w=2940&auto=format&fit=crop")
    no-repeat center center/cover;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 992px) {
    display: none;
  }
`;

export const FormColumn = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const AuthCard = styled.div`
  width: 100%;
  max-width: 420px;
  text-align: center;

  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.75rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 2.5rem;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ theme }) => theme.colors.primary.replace(")", ", 0.2)")};
  }
`;

export const OrSeparator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 1.75rem 0;
  font-size: 0.9rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

export const FinePrint = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary} !important;
  font-size: 0.9rem;
  margin-top: 2rem !important;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

export const ErrorMessage = styled.p`
  color: #dc3545 !important;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 1.5rem !important;
  text-align: center;
`;

// src/pages/AuthStyles.jsx
import styled from "styled-components";
import { motion } from "framer-motion";

// Yeni arka plan görselini import ediyoruz
import loginPageBg from "../assets/images/login-bg.jpg";
// Sol taraftaki dairesel görsel için asset
import authColumnImage from "../assets/images/auth-image.jpg";

export const AuthLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;

  /* GÜNCELLENDİ: Arka plan artık bir JPG görseli */
  background: url(${loginPageBg}) no-repeat center center/cover;
  /* Görselin üzerine hafif bir overlay ekleyerek okunabilirliği artırabiliriz */
  position: relative;

  /* Bu overlay, hem arka planı biraz karartır hem de formun daha çok öne çıkmasını sağlar */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5); /* Açık renk bir overlay */
    backdrop-filter: blur(8px); /* Modern blur efekti */
    -webkit-backdrop-filter: blur(8px);
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// Sütunların ve formun, overlay'in üzerinde kalması için position: relative ve z-index ekliyoruz
export const ImageColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    display: none;
  }
`;

export const ImageContainer = styled(motion.div)`
  width: 700px;
  height: 800px;
  border-radius: 3%;
  background: url(${authColumnImage}) no-repeat center center/cover;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
`;

export const FormColumn = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
`;

// Form kartının arkasına yarı saydam bir arka plan ekleyerek okunabilirliği artırıyoruz
export const AuthCard = styled.div`
  width: 100%;
  max-width: 420px;
  text-align: center;
  background: rgba(255, 255, 255, 0.8); /* Yarı saydam beyaz kart */
  padding: 3rem 2.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.9);

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
  background-color: #fff; /* Inputlar opak kalmalı */

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

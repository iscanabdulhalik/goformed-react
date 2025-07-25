// src/components/common/Button.jsx
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

const styles = css`
  display: inline-block;
  padding: 12px 28px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
  text-align: center;

  ${({ $primary, theme }) =>
    $primary &&
    css`
      background-color: ${theme.colors.primary};
      color: #fff;
      border: 2px solid ${theme.colors.primary};
      &:hover {
        background-color: ${theme.colors.primaryHover};
        border-color: ${theme.colors.primaryHover};
      }
    `}

  ${({ $secondary, theme }) =>
    $secondary &&
    css`
      background-color: transparent;
      color: ${theme.colors.text};
      border: 2px solid ${theme.colors.border};
      &:hover {
        border-color: ${theme.colors.primary};
        color: ${theme.colors.primary};
      }
    `}
`;

const Button = styled.button`
  ${styles}
`;
export const ButtonLink = styled(Link)`
  ${styles}
`;

export default Button;

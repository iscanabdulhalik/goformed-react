import React from "react";
import styled from "styled-components";

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem; /* İkon ve metin arası boşluk */
  margin-bottom: 2.5rem;
`;

const IconBackground = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  /* Marka renginin çok açık bir tonu */
  background-color: ${({ theme }) =>
    theme.colors.primary.replace(")", ", 0.1)")};

  /* İkonun rengi marka rengiyle aynı */
  svg {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextContent = styled.div`
  h1 {
    font-size: 2rem;
    margin: 0 0 0.25rem 0;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
    font-size: 1rem;
  }
`;

const DashboardHeader = ({ title, subtitle, icon }) => {
  return (
    <HeaderWrapper>
      {icon && <IconBackground>{icon}</IconBackground>}
      <TextContent>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </TextContent>
    </HeaderWrapper>
  );
};

export default DashboardHeader;

import React from "react";
import styled from "styled-components";
import Container from "../common/Container";
import { ButtonLink } from "../common/Button";

const CtaWrapper = styled.section`
  padding: 6rem 0;
  text-align: center;
  background-color: #ffffff;
`;
const CtaContent = styled.div`
  max-width: 650px;
  margin: 0 auto;
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 2.5rem;
  }
`;

const CtaSection = ({ id }) => {
  return (
    <CtaWrapper id={id}>
      <Container>
        <CtaContent>
          <h2>Ready to start your journey?</h2>
          <p>
            Stop letting borders limit your ambition. Join a new generation of
            global entrepreneurs and get the legal and financial tools you need
            to succeed.
          </p>
          <ButtonLink to="/register" $primary style={{ fontSize: "1.1rem" }}>
            Start My Business
          </ButtonLink>
        </CtaContent>
      </Container>
    </CtaWrapper>
  );
};

export default CtaSection;

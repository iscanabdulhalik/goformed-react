import React from "react";
import styled from "styled-components";
import Container from "../common/Container";

const TestimonialsWrapper = styled.section`
  padding: 6rem 0;
  background-color: ${({ theme }) => theme.colors.navy};
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  margin-bottom: 4rem;
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const TestimonialCard = styled.div`
  background-color: ${({ theme }) => theme.colors.lightNavy};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.lightestNavy};

  p {
    margin-bottom: 1.5rem;
  }
`;

const Author = styled.div`
  display: flex;
  align-items: center;

  cite {
    font-style: normal;
    color: ${({ theme }) => theme.colors.white};
    font-weight: 600;

    span {
      display: block;
      color: ${({ theme }) => theme.colors.slate};
      font-weight: 400;
      font-size: 0.9rem;
    }
  }
`;

const TestimonialsSection = () => (
  <TestimonialsWrapper>
    <Container>
      <SectionTitle>Trusted by Founders Worldwide</SectionTitle>
      <TestimonialGrid>
        <TestimonialCard>
          <p>
            "The entire process was shockingly simple. I had my US company and
            bank account ready in less than a week, all from my home in Nigeria.
            A true game-changer!"
          </p>
          <Author>
            <cite>
              Adewale Adebayo<span>Lagos, Nigeria</span>
            </cite>
          </Author>
        </TestimonialCard>
        <TestimonialCard>
          <p>
            "As a freelancer from Pakistan, getting access to Stripe was my
            biggest challenge. This service made it possible. Their support team
            is fantastic."
          </p>
          <Author>
            <cite>
              Fatima Khan<span>Karachi, Pakistan</span>
            </cite>
          </Author>
        </TestimonialCard>
        <TestimonialCard>
          <p>
            "I was quoted thousands by local consultants. This platform offered
            a clear, affordable path. Highly recommended for any international
            entrepreneur."
          </p>
          <Author>
            <cite>
              Marco Rossi<span>Milan, Italy</span>
            </cite>
          </Author>
        </TestimonialCard>
      </TestimonialGrid>
    </Container>
  </TestimonialsWrapper>
);

export default TestimonialsSection;

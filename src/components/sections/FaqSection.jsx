import React, { useState } from "react";
import styled from "styled-components";
import { FaPlus, FaMinus } from "react-icons/fa";
import Container from "../common/Container";

const FaqWrapper = styled.section`
  padding: 6rem 0;
  background-color: ${({ theme }) => theme.colors.background};
  scroll-margin-top: 100px; /* HEADER BOŞLUĞU */
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.8rem;
  margin-bottom: 4rem;
`;

const FaqContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FaqItemWrapper = styled.div`
  background-color: #fff;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow};
  transition: all 0.3s ease;
`;

// Soru stilini güncelledik: Renk artık temadan geliyor ve daha okunaklı
const Question = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  padding: 1.5rem;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: "Lora", sans-serif;
  color: ${({ theme }) => theme.colors.text};

  .icon {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.2rem;
    flex-shrink: 0; // İkonun küçülmesini engeller
  }
`;

const Answer = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out, padding 0.4s ease;
  font-family: "Inter", sans-serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.8;
  padding: 0 1.5rem; // Açıldığında padding olacak

  &.open {
    max-height: 300px;
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

// Veriyi belirttiğiniz siteden aldım ve güncelledim
const faqData = [
  {
    question: "Who is GoFormed for?",
    answer:
      "GoFormed is for non-UK residents who want to form a UK limited company. Our clients are typically e-commerce sellers, agency owners, consultants, coaches, and other online entrepreneurs from around the world.",
  },
  {
    question: "How long does it take to form my company?",
    answer:
      "Company registration with Companies House is typically completed within 24-48 hours. The entire process, including setting up your registered office address and digital mail service, is designed to be as fast as possible.",
  },
  {
    question: "Can I open a UK business bank account?",
    answer:
      "Yes. While we do not provide bank accounts directly, we provide guidance and introductions to several UK banking partners who offer accounts for non-resident directors. The final decision always rests with the bank.",
  },
  {
    question: "Do I need to visit the UK?",
    answer:
      "No, the entire process is 100% remote. You can start and manage your UK company from anywhere in the world without ever needing to visit the UK.",
  },
  {
    question: "What documents do I need to provide?",
    answer:
      "You will need to provide proof of identity (e.g., a valid passport) and proof of address (e.g., a recent utility bill or bank statement) for the company director(s) and shareholder(s).",
  },
];

const FaqItem = ({ item, isOpen, onClick }) => (
  <FaqItemWrapper>
    <Question onClick={onClick}>
      <span>{item.question}</span>
      <span className="icon">{isOpen ? <FaMinus /> : <FaPlus />}</span>
    </Question>
    <Answer className={isOpen ? "open" : ""}>
      <p>{item.answer}</p>
    </Answer>
  </FaqItemWrapper>
);

const FaqSection = ({ id }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <FaqWrapper id={id}>
      <Container>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <FaqContainer>
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </FaqContainer>
      </Container>
    </FaqWrapper>
  );
};

export default FaqSection;

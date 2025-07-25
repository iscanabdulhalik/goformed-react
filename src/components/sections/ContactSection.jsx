import React from "react";
import styled from "styled-components";
import Container from "../common/Container";
import Button from "../common/Button";
import { FaEnvelope, FaPhone, FaInstagram, FaTwitter } from "react-icons/fa";

const ContactWrapper = styled.section`
  padding: 6rem 0;
  background-color: ${({ theme }) => theme.colors.background};
  scroll-margin-top: 100px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 4rem;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  background-color: #fff;
  padding: 3rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow};

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  &:focus {
    /* ... */
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 150px;
  resize: vertical;
  &:focus {
    /* ... */
  }
`;

const InfoCard = styled.div`
  background-color: #1a1a1a;
  color: #fff;
  padding: 2.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};

  h3 {
    color: #fff;
  }
  p {
    color: #a0a0a0;
    margin: 1rem 0 2rem 0;
  }
`;

const ContactList = styled.ul`
  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
    color: #a0a0a0;

    .icon {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ContactSection = () => {
  return (
    <ContactWrapper id="contact">
      <Container>
        <SectionTitle>Contact Us</SectionTitle>
        <ContactGrid>
          <Form>
            <Input type="text" placeholder="Name" />
            <Input type="email" placeholder="Email" />
            <Input type="text" placeholder="Subject" />
            <Textarea placeholder="Message"></Textarea>
            <Button
              as="button"
              type="submit"
              $primary
              style={{ backgroundColor: "#1a1a1a", borderColor: "#1a1a1a" }}
            >
              Send Message
            </Button>
          </Form>
          <InfoCard>
            <h3>Contact Information</h3>
            <p>
              We are easily reachable through email, phone, and social media.
            </p>
            <ContactList>
              <li>
                <FaEnvelope className="icon" /> support@goformed.com
              </li>
              <li>
                <FaPhone className="icon" /> +1 (507) 410-4666
              </li>
              <li>
                <FaInstagram className="icon" /> @goformed
              </li>
              <li>
                <FaTwitter className="icon" /> @goformed
              </li>
            </ContactList>
          </InfoCard>
        </ContactGrid>
      </Container>
    </ContactWrapper>
  );
};

export default ContactSection;

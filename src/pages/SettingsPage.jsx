import React, { useState } from "react";
import styled from "styled-components";
import { FaCog } from "react-icons/fa";
import "react-phone-number-input/style.css"; // Kütüphanenin temel stilleri
import PhoneInput from "react-phone-number-input";

// Ortak Bileşenler
import DashboardHeader from "../components/common/DashboardHeader";
import Button from "../components/common/Button";

//--- STYLED COMPONENTS ---//

const SettingsCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 {
    font-size: 1.25rem;
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.heading};
  }
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem 2rem;
  background-color: #fcfcfc;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius};
`;

const SaveButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border-color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  padding: 0.7rem 1.8rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover};
    border-color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ theme }) => theme.colors.primary.replace(")", ", 0.2)")};
  }

  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

// PhoneInput için özel stil sarmalayıcı
const PhoneInputWrapper = styled.div`
  .PhoneInputInput {
    /* Yukarıda tanımlanan Input stilini burada tekrar kullanıyoruz */
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px
        ${({ theme }) => theme.colors.primary.replace(")", ", 0.2)")};
    }
  }
`;

//--- COMPONENT ---//

const SettingsPage = () => {
  // Telefon numarası state'i
  const [phone, setPhone] = useState("+90");

  return (
    <div>
      <DashboardHeader
        title="Settings"
        subtitle="Manage and edit your profile."
        icon={<FaCog />}
      />

      {/* Temel Bilgiler Kartı */}
      <SettingsCard>
        <CardHeader>
          <h2>Basic Info</h2>
        </CardHeader>
        <CardBody>
          <form>
            <FormRow>
              <FormGroup>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" type="text" defaultValue="Abdulhalik" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" type="text" defaultValue="İycan" />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="iscanabdulhalik@gmail.com"
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneInputWrapper>
                <PhoneInput
                  international
                  defaultCountry="TR"
                  value={phone}
                  onChange={setPhone}
                  className="PhoneInput"
                  inputComponent={Input} // Kendi Input bileşenimizi kullanıyoruz
                />
              </PhoneInputWrapper>
            </FormGroup>
          </form>
        </CardBody>
        <CardFooter>
          <SaveButton>Save Changes</SaveButton>
        </CardFooter>
      </SettingsCard>

      {/* Şifre Kartı */}
      <SettingsCard>
        <CardHeader>
          <h2>Password</h2>
        </CardHeader>
        <CardBody>
          <form>
            <FormGroup>
              <Label htmlFor="oldPassword">Old Password *</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder="Enter your old password"
              />
            </FormGroup>
            <FormRow>
              <FormGroup>
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter a new password"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
              </FormGroup>
            </FormRow>
          </form>
        </CardBody>
        <CardFooter>
          <SaveButton>Update Password</SaveButton>
        </CardFooter>
      </SettingsCard>
    </div>
  );
};

export default SettingsPage;

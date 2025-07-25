import React from "react";
import styled from "styled-components";
import DashboardHeader from "../components/common/DashboardHeader";
import Button from "../components/common/Button";
import { FaStore } from "react-icons/fa";

const marketplaceData = [
  {
    title: "ITIN",
    description:
      "ITIN allows access to more US banks, build credit history, and support your U.S. VISA. <a href='#'>Read more</a>",
    price: "$297",
    term: "Total amount",
  },
  {
    title: "Logo Design",
    description:
      "Get 3 original, custom-made logos tailored to your business style and preferences — 100% unique. <a href='#'>Read more</a>",
    price: "$50",
    term: "Total amount",
  },
  {
    title: "EIN",
    description:
      "Get your EIN in just 2-5 business days as a non-US resident. <a href='#'>Read more</a>",
    price: "$60",
    term: "Total amount",
  },
  {
    title: "UK Proof of Address",
    description:
      "Obtain a UK proof of address accepted by Stripe and UK online banking services. <a href='#'>Read more</a>",
    price: "$129",
    term: "/y",
  },
];

const MarketplaceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 1.2rem;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.95rem;
    line-height: 1.5;
    flex-grow: 1;
    margin-bottom: 1.5rem;
    a {
      color: ${({ theme }) => theme.colors.accent};
      font-weight: 500;
    }
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const PriceInfo = styled.div`
  font-weight: 600;
  .price {
    font-size: 1.5rem;
    font-family: ${({ theme }) => theme.fonts.heading};
  }
  .term {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
    font-weight: 500;
  }
`;

const OrderButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border-color: ${({ theme }) => theme.colors.accent};
  padding: 0.6rem 1.2rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover};
    border-color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const MarketplacePage = () => {
  return (
    <div>
      <DashboardHeader title="Marketplace" icon={<FaStore />} />
      <MarketplaceGrid>
        {marketplaceData.map((item) => (
          <ProductCard key={item.title}>
            <h3>{item.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: item.description }} />
            <CardFooter>
              <PriceInfo>
                <span className="price">{item.price}</span>
                <span className="term"> {item.term}</span>
              </PriceInfo>
              <OrderButton>Order</OrderButton>
            </CardFooter>
          </ProductCard>
        ))}
      </MarketplaceGrid>
    </div>
  );
};

export default MarketplacePage;

import React from "react";
import styled from "styled-components";
import { FaListAlt, FaPlus, FaSearch } from "react-icons/fa";

// Ortak Bileşenler
import DashboardHeader from "../components/common/DashboardHeader";
import Button from "../components/common/Button";

//--- STYLED COMPONENTS ---//

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  .icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchInput = styled.input`
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  width: 320px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ theme }) => theme.colors.primary.replace(")", ", 0.2)")};
  }
`;

const NewOrderButton = styled(Button)`
  /* Temanın birincil rengini kullanıyoruz */
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const TableWrapper = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 1.2rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    /* Tablo başlığını daha yumuşak hale getiriyoruz */
    background-color: #fcfcfc;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const NoDataCell = styled.td`
  text-align: center !important;
  padding: 5rem 1rem !important;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

//--- COMPONENT ---//

const OrdersPage = () => {
  return (
    <div>
      <DashboardHeader
        title="Orders list"
        subtitle="Manage your orders"
        icon={<FaListAlt />}
      />
      <Toolbar>
        <SearchWrapper>
          <FaSearch className="icon" />
          <SearchInput placeholder="Search by item or order number..." />
        </SearchWrapper>
        <NewOrderButton>
          <FaPlus /> New order
        </NewOrderButton>
      </Toolbar>
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <th>Item</th>
              <th>Order number</th>
              <th>Price</th>
              <th>Status</th>
              <th>Updated at</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <NoDataCell colSpan="6">No data available in table</NoDataCell>
            </tr>
          </tbody>
        </StyledTable>
      </TableWrapper>
    </div>
  );
};

export default OrdersPage;

// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AssignFunctionality from "./pages/AssignFunctionality";

// Masters (forms)
import UnitCompanyMaster from "./components/masters/UnitCompanyMaster";
import ItemMaster from "./components/masters/ItemMaster";
import CustomerMaster from "./components/masters/CustomerMaster";
import SupplierMaster from "./components/masters/SupplierMaster";
import EmployeeMaster from "./components/masters/EmployeeMaster";
import DesignationMaster from "./components/masters/DesignationMaster";
import QualificationMaster from "./components/masters/QualificationMaster";
import CityMaster from "./components/masters/CityMaster";
import ExpensesMaster from "./components/masters/ExpensesMaster";
import RoleMaster from "./components/masters/RoleMaster";
import UserMaster from "./components/masters/UserMaster"
import DepartmentMaster from "./components/masters/DepartmentMaster"
import FunctionalityMaster from "./components/masters/FunctionalityMaster"
import DashboardMaster from "./components/masters/DashboardMaster"
import GSTMaster from "./components/masters/GSTMaster"
import ItemUnitMaster from "./components/masters/ItemUnitMaster"
import HSNMaster from "./components/masters/HSNMaster"
import TransportMaster from "./components/masters/TransportMaster"
import BankMaster from "./components/masters/BankMaster";
import FinancialYearMaster from "./components/masters/FinalcialYearMaster"
import PaymentModeMaster from "./components/masters/PaymentModeMaster"
import StateMaster from "./components/masters/StateMaster";
import TermsAndConditionMaster from "./components/masters/TermsAndConditionMaster";
import CountryMaster from "./components/masters/CountryMaster"


// Masters lists
import UnitCompanyList from "./components/masterslist/UnitCompanyList";
import ItemMasterList from "./components/masterslist/ItemMasterList";
import CustomerMasterList from "./components/masterslist/CustomerMasterList";
import SupplierMasterList from "./components/masterslist/SupplierMasterList";
import EmployeeMasterList from "./components/masterslist/EmployeeMasterList";
import DesignationMasterList from "./components/masterslist/DesignationMasterList";
import QualificationMasterList from "./components/masterslist/QualificationMasterList";
import CityMasterList from "./components/masterslist/CityMasterList";
import ExpensesMasterList from "./components/masterslist/ExpensesMasterList";
import RoleMasterList from "./components/masterslist/RoleMasterList";
import UserMasterList from "./components/masterslist/UserMasterList";
import DepartmentMasterList from "./components/masterslist/DepartmentMasterList";
import FunctionalityMasterList from "./components/masterslist/FunctionalityMasterList"
import DashboardMasterList from "./components/masterslist/DashboardMasterList"
import GSTMasterList from "./components/masterslist/GSTMasterList"
import ItemUnitMasterList from "./components/masterslist/ItemUnitMasterList"
import HSNMasterList from "./components/masterslist/HSNMasterList"
import TransportMasterList from "./components/masterslist/TransportMasterList"
import BankMasterList from "./components/masterslist/BankMasterList";
import FinancialYearMasterList from "./components/masterslist/FinancialYearMasterList"
import PaymentModeMasterList from "./components/masterslist/PaymentModeMasterList"
import StateMasterList from "./components/masterslist/StateMasterList"
import TermsAndConditionMasterList from "./components/masterslist/TermsAndConditionMasterList";
import CountryMasterList from "./components/masterslist/CountryMasterList";


// Invoces

// Purchase List
import AssetPurchase from "./components/purchase/AssetPurchase";
import PurchaseReturn from "./components/purchase/PurchaseReturn";
import PurchaseStock from "./components/purchase/PurchaseStock"

// Billing 
import Billing from "./components/billing/Billing";
import BillingV1 from "./components/billing/BillingV1";
import BillingV2 from "./components/billing/BillingV2";
import BillingV3 from "./components/billing/BillingV3";
import BillingV4 from "./components/billing/BillingV4";

// Billing Invoice List
import BillingV4List from "./components/billingInvoiceList/BillingV4List";

// Billing Return List
import BillingReturnV4 from "./components/billingreturn/BillingReturnV4";

// Billing Settlement Screen
import BillingV4Settlement from "./components/settelment/BillingV4Settelment";

// Inventory Screens
import OpeningStock from "./components/inventory/OpeningStock";
import StockExpiry from "./components/inventory/StockExpiry";
import StockOrder from "./components/inventory/StockOrder";
import StockTransfer from "./components/inventory/StockTransfer";

// Inventory Forms
import OpeningStockForm from "./components/inventoryForms/OpeningStockForm";
import StockExpiryForm from "./components/inventoryForms/StockExpiryForm";
import StockOrderForm from "./components/inventoryForms/StockOrderFom";
import StockTransferForm from "./components/inventoryForms/StockTransferForm";
// Transactions
import BillingTransaction from "./components/transactions/BillingTransactions";
import PurchaseTransaction from "./components/transactions/PurchaseTransactions";

// Expenses
import DailyExpenses from "./components/expenses/DailyExpenses";
import EmployeeExpenses from "./components/expenses/EmployeeExpenses"


// Reports

// Purchase Report
import AssetPurchaseReport from "./components/reports/purchasereports/AssetPurchaseReport";
import PurchaseReport from "./components/reports/purchasereports/PurchaseReport";
import PurchaseReturnReport from "./components/reports/purchasereports/PurchaseReturnReport";

// Stock Report
import StockReport from "./components/reports/stocks/StockReport";
import FinalStockReport from "./components/reports/stocks/FinalStockReport"

// Billing Report
import BillReport from "./components/reports/billing/BillReport";
import BillReturnReport from "./components/reports/billing/BillReturnReport"

import SettingsPage from "./pages/Setting";

// 🔹 Contexts (ye paths tumhare folder structure ke hisaab se)
import { ToastProvider } from "./components/contextapi/ToastContext";
import { ExportProvider } from "./components/contextapi/ExportContext";
import { ActionProvider } from "./components/contextapi/ActionsContext";
import { PaymentProvider } from "./components/contextapi/PaymentContext";

import InvoicePrint from
"./components/contextapi/print/InvoicePrint";




export default function App() {
  return (
    // Sabse outer: ToastProvider (taaki har jagah toast available ho)
    <ToastProvider>
      {/* ExportProvider: Excel / PDF / Print logic share karega */}
      <ExportProvider>
        
        {/* ActionProvider: view / edit / delete jaise common actions share karega */}
        <ActionProvider>
          <PaymentProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Layout */}
            <Route path="/" element={<DashboardLayout />}>
              {/* DEFAULT PAGE = HOME */}
              <Route index element={<Home />} />

              {/* Dashboard page */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Masters */}
              <Route path="unit-company" element={<UnitCompanyMaster />} />
              <Route path="item-master" element={<ItemMaster />} />
              <Route path="customer-master" element={<CustomerMaster />} />
              <Route path="supplier-master" element={<SupplierMaster />} />
              <Route path="employee-master" element={<EmployeeMaster />} />
              <Route path="designation-master" element={<DesignationMaster />} />
              <Route path="qualification-master" element={<QualificationMaster />} />
              <Route path="city-master" element={<CityMaster />} />
              <Route path="expenses-master" element={<ExpensesMaster />} />
              <Route path="role-master" element={<RoleMaster />} />
              <Route path="user-master" element={<UserMaster />} />
              <Route path="department-master" element={<DepartmentMaster />} />

              <Route path="functionality-master" element={<FunctionalityMaster />} />
              <Route path="dashboard-master" element={<DashboardMaster />} />
              <Route path="gst-master" element={<GSTMaster />} />
              <Route path="itemunit-master" element={<ItemUnitMaster />} />
              <Route path="hsn-master" element={<HSNMaster />} />
              <Route path="transport-master" element={<TransportMaster />} />
              <Route path="bank-master" element={<BankMaster />} />
              <Route path="financialyear-master" element={<FinancialYearMaster />} />
              <Route path="paymentmode-master" element={<PaymentModeMaster />} />
              <Route path="state-master" element={<StateMaster />} />
              <Route path="termsandcondition-master" element={<TermsAndConditionMaster />} />
              <Route path="country-master" element={<CountryMaster />} />



              {/* Lists */}
              <Route path="unit-company-list" element={<UnitCompanyList />} />
              <Route path="item-master-list" element={<ItemMasterList />} />
              <Route path="customer-master-list" element={<CustomerMasterList />} />
              <Route path="supplier-master-list" element={<SupplierMasterList />} />
              <Route path="employee-master-list" element={<EmployeeMasterList />} />
              <Route path="designation-master-list" element={<DesignationMasterList />} />
              <Route path="qualification-master-list" element={<QualificationMasterList />} />
              <Route path="city-master-list" element={<CityMasterList />} />
              <Route path="expenses-master-list" element={<ExpensesMasterList />} />
              <Route path="role-master-list" element={<RoleMasterList />} />
              <Route path="user-master-list" element={<UserMasterList />} />
              <Route path="department-master-list" element={<DepartmentMasterList />} />
              <Route path="functionality-master-list" element={<FunctionalityMasterList />} />
              <Route path="dashboard-master-list" element={<DashboardMasterList />} />
              <Route path="gst-master-list" element={<GSTMasterList />} />
              <Route path="itemunit-master-list" element={<ItemUnitMasterList />} />
              <Route path="hsn-master-list" element={<HSNMasterList />} />
              <Route path="transport-master-list" element={<TransportMasterList />} />
              <Route path="bank-master-list" element={<BankMasterList />} />
              <Route path="financialyear-master-list" element={<FinancialYearMasterList />} />
              <Route path="paymentmode-master-list" element={<PaymentModeMasterList />} />
              <Route path="state-master-list" element={<StateMasterList />} />
              <Route path="termsandcondition-master-list" element={<TermsAndConditionMasterList />} />
              <Route path="country-master-list" element={<CountryMasterList />} />

               {/* Purchase  */}
               <Route path="asset-purchase" element={<AssetPurchase />} />
               <Route path="purchase-return" element={<PurchaseReturn />} />
               <Route path="purchase-stock" element={<PurchaseStock />} />

               {/* Billing */}
                <Route path="billing" element={<Billing />} />
                <Route path="billing_v1" element={<BillingV1/>}/>
                 <Route path="billing_v2" element={<BillingV2/>}/>
                <Route path="billing_v3" element={<BillingV3/>}/>
                <Route path="billing_v4" element={<BillingV4 />}/>

                {/* Billing Invoice List */}
                <Route path="billing-v4-list" element={<BillingV4List />} />

                {/* Billing Return  */}
                <Route path="/billing-return-v4" element={<BillingReturnV4/>} />

                  {/* Billing Settlement  */}
                <Route path="/billing-settlement-v4" element={<BillingV4Settlement />} />

               {/* Inventory */}
                <Route path="opening-stock" element={<OpeningStock />} />
                <Route path="stock-expiry" element={<StockExpiry />} />
                <Route path="stock-order" element={<StockOrder />} />
                <Route path="stock-transfer" element={<StockTransfer />} />

                {/* Inventory Forms */}
                <Route path="opening-stock-form" element={<OpeningStockForm />} />
                <Route path="stock-expiry-form" element={<StockExpiryForm />} />
                <Route path="stock-order-form" element={<StockOrderForm />} />
                <Route path="stock-transfer-form" element={<StockTransferForm />} />

                {/* Transactions */}
                <Route path="bill-transaction" element={<BillingTransaction />} />
                <Route path="purchase-transaction" element={<PurchaseTransaction />} />

                {/* Expenses */}
                <Route path="daily-expenses" element={<DailyExpenses />} />
                <Route path="employee-expenses" element={<EmployeeExpenses />} />

                {/* All Reports */}
               
                   <Route path="assetpurchase-report" element={<AssetPurchaseReport />} />
                   <Route path="purchase-report" element={<PurchaseReport />} />
                   <Route path="purchasereturn-report" element={<PurchaseReturnReport />} />

                    <Route path="stock-report" element={<StockReport />} />
                    <Route path="finalstock-report" element={<FinalStockReport />} />

                     <Route path="bill-report" element={<BillReport />} />
                      <Route path="billreturn-report" element={<BillReturnReport />} />



                    {/* Reports Route End Here */}
  {/* ----------------------------------------------------------------------------------------------------------------------- */}

              <Route path="assign-functionality" element={<AssignFunctionality />} />
              <Route path="setting-functionality" element={<SettingsPage />} />

              {/* fallback inside layout */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* fallback to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </PaymentProvider>
        </ActionProvider>
        
      </ExportProvider>
    </ToastProvider>
  );
}

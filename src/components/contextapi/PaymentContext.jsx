import React, { createContext, useContext, useState } from "react";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [activeMethods, setActiveMethods] = useState([
    { type: "Cash", id: "initial-cash" },
  ]);
  const [paymentSplit, setPaymentSplit] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentRefs, setPaymentRefs] = useState({});
  const [discountMode, setDiscountMode] = useState({});

  return (
    <PaymentContext.Provider
      value={{
        activeMethods,
        setActiveMethods,
        paymentSplit,
        setPaymentSplit,
        showPaymentModal,
        setShowPaymentModal,
        paymentRefs,
        setPaymentRefs,
        discountMode,
        setDiscountMode,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
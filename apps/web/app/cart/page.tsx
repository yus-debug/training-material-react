// apps/web/app/cart/page.tsx
'use client';
import React, { useState } from 'react';
import {Container,Paper,Stepper,Step,StepLabel,Box} from '@mui/material';
import { CartStep } from '../../components/cart/CartStep';
import { CustomerStep } from '../../components/cart/CustomerStep';
import { ReviewStep } from '../../components/cart/ReviewStep';
import { ConfirmationStep } from '../../components/cart/ConfirmationStep';

const steps = ['Cart', 'Customer', 'Review', 'Confirmation'];

export default function CartPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCustomerSelected = (id: number) => {
    setCustomerId(id);
    handleNext();
  };

  const handleOrderCompleted = (orderNum: string) => {
    setOrderNumber(orderNum);
    handleNext();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CartStep onNext={handleNext} />;
      case 1:
        return (
          <CustomerStep
            onNext={handleCustomerSelected}
            onBack={handleBack}
            selectedCustomerId={customerId || undefined}
          />
        );
      case 2:
        return (
          <ReviewStep
            customerId={customerId!}
            onNext={handleOrderCompleted}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            orderNumber={orderNumber!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3 }}>
          {renderStepContent(activeStep)}
        </Box>
      </Paper>
    </Container>
  );
}
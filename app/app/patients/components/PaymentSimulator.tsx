"use client";
import React from "react";
import { CreditCard } from "lucide-react";

interface PaymentSimulatorProps {
  paymentData: any;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function PaymentSimulator({ paymentData, onCancel, onSubmit }: PaymentSimulatorProps) {
  if (!paymentData) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border p-6 rounded-2xl w-full max-w-sm shadow-lg flex flex-col gap-5 text-center">
        <div className="mx-auto size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"><CreditCard className="size-6" /></div>
        <div>
          <h3 className="font-black text-xl text-foreground">Razorpay Checkout</h3>
          <p className="text-xs text-muted-foreground mt-1">Simulating payment verification for booking</p>
        </div>
        <div className="bg-muted p-4 rounded-xl flex justify-between items-center text-sm font-bold">
          <span className="text-muted-foreground">Amount Due</span>
          <span className="text-primary text-lg font-black">${paymentData.amount}</span>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">By clicking confirm, we will simulate a success response from Razorpay and update your booking status immediately.</div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-grow py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground">Cancel</button>
          <button onClick={onSubmit} className="flex-grow py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-sm font-bold">Pay & Confirm</button>
        </div>
      </div>
    </div>
  );
}

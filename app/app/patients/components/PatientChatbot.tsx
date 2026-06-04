"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Globe, MessageSquare, X, Calendar, Plus, CreditCard, Activity } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getDepartments } from "@/services/department.services";
import { getClinicServices } from "@/services/clinicService.services";
import { getDoctors } from "@/services/doctor.services";
import { bookAppointment } from "@/services/appointment.services";
import { verifyPayment } from "@/services/payment.services";
import { bookLabTest } from "@/services/report.services";

const LOCALIZED_TEXTS: Record<string, Record<string, string>> = {
  English: {
    welcome: "Hello! I am your MediMind AI Assistant. I can answer medical questions or guide you through bookings.\n\nType '/book' to schedule an appointment, or '/test' to book a laboratory test.",
    chooseDept: "Let's schedule a clinical appointment. Please choose a medical department from the options below:",
    noDoc: "No doctors are currently available in this department. Please try another department.",
    chooseDoc: "Great! Please select your consulting physician from",
    chooseDateSlot: "Excellent choice. Now select a date and an available slot for your consult:",
    confirmAppt: "Confirm your appointment schedule:\n- Doctor: {doctor}\n- Dept: {dept}\n- Time: {time}\n- Cost: ${cost}\n\nClick below to pay and book:",
    successAppt: "Congratulations! Your appointment with {doctor} has been booked and paid successfully. 🎉\n\nYou can view it anytime on your portal dashboard.",
    chooseTest: "Let's book a laboratory test. Select a diagnostic investigation from the options below:",
    confirmTest: "Review your investigation booking:\n- Test: {test}\n- Total cost: ${price}\n\nClick below to proceed and finalize:",
    successTest: "Your laboratory test \"{test}\" has been successfully booked and paid! 🎉 You can visit the diagnostics lab for sample collection.",
    checkoutError: "Oops! There was an issue processing your booking request. Please check slot availability and try again.",
    selected: "Selected",
    preferredTime: "Preferred time"
  },
  Bengali: {
    welcome: "হ্যালো! আমি আপনার মেডিমাইন্ড এআই হেলথ অ্যাসিস্ট্যান্ট। আমি স্বাস্থ্য সংক্রান্ত প্রশ্নের উত্তর দিতে পারি অথবা বুকিং করতে সাহায্য করতে পারি।\n\nঅ্যাপয়েন্টমেন্ট বুক করতে '/book' লিখুন, অথবা ল্যাব টেস্ট বুক করতে '/test' লিখুন।",
    chooseDept: "আসুন একটি অ্যাপয়েন্টমেন্ট বুক করি। অনুগ্রহ করে নিচের তালিকা থেকে একটি বিভাগ নির্বাচন করুন:",
    noDoc: "এই বিভাগে বর্তমানে কোনো ডাক্তার উপলব্ধ নেই। অনুগ্রহ করে অন্য কোনো বিভাগ চেষ্টা করুন।",
    chooseDoc: "চমৎকার! অনুগ্রহ করে আপনার ডাক্তার নির্বাচন করুন:",
    chooseDateSlot: "দুর্দান্ত পছন্দ। এবার পরামর্শের জন্য একটি তারিখ এবং সময় নির্বাচন করুন:",
    confirmAppt: "আপনার অ্যাপয়েন্টমেন্টের তথ্য নিশ্চিত করুন:\n- ডাক্তার: {doctor}\n- বিভাগ: {dept}\n- সময়: {time}\n- খরচ: ${cost}\n\nবুকিং সম্পন্ন করতে নিচে ক্লিক করুন:",
    successAppt: "অভিনন্দন! {doctor}-এর সাথে আপনার অ্যাপয়েন্টমেন্ট বুকিং এবং পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। 🎉\n\nআপনি যেকোনো সময় আপনার ড্যাশবোর্ডে এটি দেখতে পারেন।",
    chooseTest: "আসুন ল্যাব টেস্ট বুক করি। অনুগ্রহ করে নিচের তালিকা থেকে পরীক্ষাটি নির্বাচন করুন:",
    confirmTest: "আপনার ল্যাব টেস্ট বুকিং পর্যালোচনা করুন:\n- পরীক্ষা: {test}\n- মোট খরচ: ${price}\n\nনিশ্চিত করতে নিচে ক্লিক করুন:",
    successTest: "আপনার ল্যাব টেস্ট \"{test}\" সফলভাবে বুকিং এবং পেমেন্ট সম্পন্ন হয়েছে! 🎉 আপনি পরীক্ষার জন্য ক্লিনিকে যেতে পারেন।",
    checkoutError: "দুঃখিত! বুকিং প্রক্রিয়া সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে অন্য স্লট চেষ্টা করুন।",
    selected: "নির্বাচিত",
    preferredTime: "পছন্দের সময়"
  },
  Hindi: {
    welcome: "नमस्ते! मैं आपका मेडिमाइंड एआई स्वास्थ्य सहायक हूं। मैं आपके चिकित्सा प्रश्नों के उत्तर दे सकता हूं या बुकिंग में आपकी सहायता कर सकता हूं।\n\nअपॉइंटमेंट बुक करने के लिए '/book' लिखें, या लैब टेस्ट बुक करने के लिए '/test' लिखें।",
    chooseDept: "आइए एक अपॉइंटमेंट बुक करें। कृपया नीचे दिए गए विकल्पों में से एक विभाग चुनें:",
    noDoc: "इस विभाग में वर्तमान में कोई डॉक्टर उपलब्ध नहीं है। कृपया दूसरा विभाग चुनें।",
    chooseDoc: "बहुत बढ़िया! कृपया अपने चिकित्सक का चयन करें:",
    chooseDateSlot: "बेहतरीन विकल्प। अब परामर्श के लिए एक तिथि और उपलब्ध समय स्लॉट चुनें:",
    confirmAppt: "अपने अपॉइंटमेंट विवरण की पुष्टि करें:\n- डॉक्टर: {doctor}\n- विभाग: {dept}\n- समय: {time}\n- शुल्क: ${cost}\n\nबुक करने के लिए नीचे क्लिक करें:",
    successAppt: "बधाई हो! {doctor} के साथ आपका अपॉइंटमेंट सफलतापूर्वक बुक और भुगतान हो गया है। 🎉\n\nआप इसे अपने डैशबोर्ड पर कभी भी देख सकते हैं।",
    chooseTest: "आइए एक लैब टेस्ट बुक करें। नीचे दिए गए विकल्पों में से नैदानिक जांच का चयन करें:",
    confirmTest: "अपनी जांच बुकिंग की समीक्षा करें:\n- टेस्ट: {test}\n- कुल लागत: ${price}\n\nपुष्टि करने के लिए नीचे क्लिक करें:",
    successTest: "आपका लैब टेस्ट \"{test}\" सफलतापूर्वक बुक और भुगतान हो गया है! 🎉 आप जांच के लिए लैब जा सकते हैं।",
    checkoutError: "अपॉइंटमेंट बुक करने में समस्या हुई। कृपया समय स्लॉट जांचें और पुनः प्रयास करें।",
    selected: "चयनित",
    preferredTime: "पसंदीदा समय"
  }
};

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  options?: Array<{ label: string; value: string; price?: number }>;
  isCheckout?: boolean;
  isDateSlotPicker?: boolean;
}

export default function PatientChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your MediMind AI Assistant. I can answer medical questions or guide you through bookings.\n\nType '/book' to schedule an appointment, or '/test' to book a laboratory test.",
    },
  ]);
  const [chatLanguage, setChatLanguage] = useState("English");
  const [inputVal, setInputVal] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Booking Flow States
  const [bookingFlow, setBookingFlow] = useState<"none" | "appointment" | "test">("none");
  const [bookingStep, setBookingStep] = useState(0);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDeptName, setSelectedDeptName] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedDocName, setSelectedDocName] = useState("");
  const [selectedDocFee, setSelectedDocFee] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  
  const [selectedTestId, setSelectedTestId] = useState("");
  const [selectedTestName, setSelectedTestName] = useState("");
  const [selectedTestPrice, setSelectedTestPrice] = useState(0);

  // Master Data Cache
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [clinicServices, setClinicServices] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Dynamic welcome message translation if untouched
    if (messages.length === 1 && messages[0].id === "welcome") {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: LOCALIZED_TEXTS[chatLanguage]?.welcome || LOCALIZED_TEXTS.English.welcome
        }
      ]);
    }
  }, [chatLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const loadMasterData = async () => {
    try {
      const [deptData, docData, serviceData] = await Promise.all([
        getDepartments(),
        getDoctors(),
        getClinicServices()
      ]);
      setDepartments(deptData);
      setDoctors(docData);
      setClinicServices(serviceData.filter((s: any) => s.type === "Laboratory" || s.type === "Radiology"));
    } catch (err) {
      console.error("Failed to load master data for chatbot", err);
    }
  };

  const addMessage = (sender: "user" | "bot", text: string, extra?: Partial<Message>) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender,
      text,
      ...extra
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Start Appointment Flow
  const startAppointmentFlow = () => {
    setBookingFlow("appointment");
    setBookingStep(1);
    const texts = LOCALIZED_TEXTS[chatLanguage] || LOCALIZED_TEXTS.English;
    addMessage("bot", texts.chooseDept, {
      options: departments.map((d) => ({ label: d.name, value: d._id }))
    });
  };

  // Start Lab Test Flow
  const startLabTestFlow = () => {
    setBookingFlow("test");
    setBookingStep(1);
    const texts = LOCALIZED_TEXTS[chatLanguage] || LOCALIZED_TEXTS.English;
    addMessage("bot", texts.chooseTest, {
      options: clinicServices.map((s) => ({ label: `${s.name} ($${s.price})`, value: s._id, price: s.price }))
    });
  };

  const handleOptionClick = (option: { label: string; value: string; price?: number }) => {
    const texts = LOCALIZED_TEXTS[chatLanguage] || LOCALIZED_TEXTS.English;
    addMessage("user", `${texts.selected}: ${option.label}`);

    if (bookingFlow === "appointment") {
      if (bookingStep === 1) {
        setSelectedDeptId(option.value);
        setSelectedDeptName(option.label);
        setBookingStep(2);

        const deptDocs = doctors.filter(
          (d: any) => d.department === option.value || (d.departments && d.departments.includes(option.value))
        );

        if (deptDocs.length === 0) {
          addMessage("bot", texts.noDoc);
          setBookingFlow("none");
          setBookingStep(0);
        } else {
          addMessage("bot", `${texts.chooseDoc} ${option.label}:`, {
            options: deptDocs.map((d) => ({
              label: `${d.user?.name || "Doctor"} - Fee: $${d.consultationFee}`,
              value: d._id,
              price: d.consultationFee
            }))
          });
        }
      } else if (bookingStep === 2) {
        setSelectedDocId(option.value);
        setSelectedDocName(option.label.split(" - ")[0]);
        setSelectedDocFee(option.price || 150);
        setBookingStep(3);

        addMessage("bot", texts.chooseDateSlot, {
          isDateSlotPicker: true
        });
      }
    } else if (bookingFlow === "test") {
      if (bookingStep === 1) {
        setSelectedTestId(option.value);
        setSelectedTestName(option.label.split(" ($")[0]);
        setSelectedTestPrice(option.price || 50);
        setBookingStep(2);

        const msgText = texts.confirmTest
          .replace("{test}", option.label.split(" ($")[0])
          .replace("{price}", (option.price || 50).toString());

        addMessage("bot", msgText, {
          isCheckout: true
        });
      }
    }
  };

  const handleDateSlotSelect = (date: string, slot: string) => {
    if (!date || !slot) return;
    const texts = LOCALIZED_TEXTS[chatLanguage] || LOCALIZED_TEXTS.English;
    setSelectedDate(date);
    setSelectedTimeSlot(slot);
    setBookingStep(4);
    
    addMessage("user", `${texts.preferredTime}: ${new Date(date).toLocaleDateString()} at ${slot}`);

    const msgText = texts.confirmAppt
      .replace("{doctor}", selectedDocName)
      .replace("{dept}", selectedDeptName)
      .replace("{time}", `${new Date(date).toLocaleDateString()} at ${slot}`)
      .replace("{cost}", selectedDocFee.toString());

    addMessage("bot", msgText, {
      isCheckout: true
    });
  };

  const handleFinalCheckout = async () => {
    setIsBotTyping(true);
    const texts = LOCALIZED_TEXTS[chatLanguage] || LOCALIZED_TEXTS.English;
    try {
      if (bookingFlow === "appointment") {
        const response = await bookAppointment({
          doctorId: selectedDocId,
          departmentId: selectedDeptId,
          date: selectedDate,
          timeSlot: selectedTimeSlot
        });

        const apptId = response.appointment?._id || response.report?._id;
        
        await verifyPayment({
          orderId: `order_${Math.random().toString(36).substring(2, 9)}`,
          paymentId: `pay_${Math.random().toString(36).substring(2, 9)}`,
          referenceId: apptId,
          type: "Appointment",
          amount: selectedDocFee
        });

        const msgText = texts.successAppt.replace("{doctor}", selectedDocName);
        addMessage("bot", msgText);
      } else if (bookingFlow === "test") {
        const response = await bookLabTest(selectedTestId);
        const reportId = response.report?._id;

        await verifyPayment({
          orderId: `order_${Math.random().toString(36).substring(2, 9)}`,
          paymentId: `pay_${Math.random().toString(36).substring(2, 9)}`,
          referenceId: reportId,
          type: "Test",
          amount: selectedTestPrice
        });

        const msgText = texts.successTest.replace("{test}", selectedTestName);
        addMessage("bot", msgText);
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
      addMessage("bot", texts.checkoutError);
    } finally {
      setIsBotTyping(false);
      setBookingFlow("none");
      setBookingStep(0);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const query = inputVal.trim();
    setInputVal("");
    addMessage("user", query);

    // Command matching
    if (query.toLowerCase() === "/book" || query.toLowerCase().includes("book appointment")) {
      startAppointmentFlow();
      return;
    }

    if (query.toLowerCase() === "/test" || query.toLowerCase().includes("book lab test") || query.toLowerCase().includes("book test")) {
      startLabTestFlow();
      return;
    }

    // Default chat completion Q&A
    setIsBotTyping(true);
    try {
      const res = await api.post("/chats/ai", {
        message: query,
        language: chatLanguage
      });
      if (res.data?.warning) {
        toast.warning(res.data.warning);
      }
      addMessage("bot", res.data.reply || "I didn't receive a response.");
    } catch (err: any) {
      addMessage("bot", "Sorry, I had trouble processing that request. Please try again.");
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Anchor Bottom Right Area) */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary hover:bg-primary/95 text-primary-foreground p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 font-bold text-xs"
        >
          <MessageSquare className="size-5 shrink-0" />
          <span className="hidden sm:inline">AI Medical Assistant</span>
        </button>
      </div>

      {/* Expanded Chat Drawer Dialog */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 w-[350px] sm:w-[380px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden no-print animate-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4.5 text-purple-500" />
              <span className="font-bold text-xs text-foreground">MediMind AI Health Assistant</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg border border-border text-[10px] text-foreground font-semibold">
                <Globe className="size-3 text-muted-foreground" />
                <select
                  value={chatLanguage}
                  onChange={(e) => setChatLanguage(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="English">EN</option>
                  <option value="Hindi">हिन्दी</option>
                  <option value="Bengali">বাংলা</option>
                </select>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Logger */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin bg-muted/5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] gap-1.5 ${
                  m.sender === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground border border-border/55 rounded-tl-none whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>

                {/* Option Buttons */}
                {m.options && m.options.length > 0 && (
                  <div className="flex flex-col gap-1 w-full mt-1.5">
                    {m.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionClick(opt)}
                        className="bg-card hover:bg-primary/5 hover:border-primary text-primary text-[10px] font-bold py-1.5 px-3 rounded-lg border border-border transition-all text-left"
                      >
                        👉 {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Date & Time Slot Picker Container */}
                {m.isDateSlotPicker && (
                  <div className="flex flex-col gap-3 bg-muted/40 border border-border/50 p-3 rounded-xl w-full mt-1.5 text-[10px]">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-muted-foreground">Select Consult Date:</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          const dateVal = e.target.value;
                          if (dateVal) {
                            // Show slot options below
                            const defaultSlot = "10:00 AM";
                            handleDateSlotSelect(dateVal, defaultSlot);
                          }
                        }}
                        className="bg-card border border-border p-1.5 rounded outline-none w-full text-[10px]"
                      />
                    </div>
                  </div>
                )}

                {/* Checkout simulator card */}
                {m.isCheckout && (
                  <div className="w-full mt-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl flex flex-col gap-2 text-[10px]">
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <CreditCard className="size-3.5" /> Simulated Checkout Gateway
                    </span>
                    <button
                      onClick={handleFinalCheckout}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg transition-all text-center w-full"
                    >
                      Confirm Payment & Authorize Booking
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isBotTyping && (
              <div className="self-start flex items-center gap-1.5 bg-muted text-muted-foreground p-3 rounded-2xl rounded-tl-none border border-border/50 text-[10px]">
                <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-muted/10 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask medical Qs or type /book..."
              className="flex-1 bg-muted border border-border px-3 py-2 rounded-xl text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/95 transition-colors"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import PaymentSimulator from "../components/PaymentSimulator";
import { getAppointments, bookAppointment } from "@/services/appointment.services";
import { getDepartments } from "@/services/department.services";
import { getDoctors } from "@/services/doctor.services";
import { verifyPayment } from "@/services/payment.services";
import { useAuth } from "@/contexts/AuthContext";

// Modular Components
import DepartmentTabs from "./components/DepartmentTabs";
import DoctorCard from "./components/DoctorCard";
import BookingSheet from "./components/BookingSheet";

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const [bookingDeptId, setBookingDeptId] = useState("");
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");

  const [paymentData, setPaymentData] = useState<any | null>(null);

  // Month navigation for the custom Calendar UI
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [deptData, docData, apptData] = await Promise.all([
        getDepartments(),
        getDoctors(),
        getAppointments(true),
      ]);
      setDepartments(deptData);
      setDoctors(docData);
      setAppointments(apptData);

      if (deptData.length > 0) {
        setSelectedDeptId(deptData[0]._id);
        setBookingDeptId(deptData[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setBookingDeptId(deptId);
    setBookingDoctorId("");
    setBookingDate("");
    setBookingSlot("");
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await bookAppointment({
        doctorId: bookingDoctorId,
        departmentId: bookingDeptId,
        date: bookingDate,
        timeSlot: bookingSlot
      });
      
      setPaymentData({
        amount: doctors.find((d) => d._id === bookingDoctorId)?.consultationFee || 150,
        type: "Appointment",
        referenceId: data.appointment._id
      });
      setBookingDate("");
      setBookingSlot("");
    } catch (err: any) {
      alert(err.message || "Booking conflict / error");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!paymentData) return;
    try {
      await verifyPayment({
        orderId: `order_${Math.random().toString(36).substring(2, 9)}`,
        paymentId: `pay_${Math.random().toString(36).substring(2, 9)}`,
        referenceId: paymentData.referenceId,
        type: paymentData.type,
        amount: paymentData.amount
      });
      alert("Payment completed successfully!");
      setPaymentData(null);
      setBookingDoctorId("");
      const apptData = await getAppointments(true);
      setAppointments(apptData);
    } catch (err: any) {
      alert(err.message || "Payment verification failed");
    }
  };

  // Filter doctors based on selected department tab
  const filteredDoctors = doctors.filter((doc) => {
    return doc.department === selectedDeptId || (doc.departments && doc.departments.includes(selectedDeptId));
  });

  // Check availability status of a doctor on a specific date (including past dates check)
  const getDateStatus = (doc: any, dateObj: Date) => {
    if (!doc || !dateObj) return { isAvailable: false, reason: "absent", count: 0, limit: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateObj);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < today) {
      return { isAvailable: false, reason: "past", count: 0, limit: 0 };
    }

    const appointmentsOnDate = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        apt.doctor?._id === doc._id &&
        aptDate.getDate() === dateObj.getDate() &&
        aptDate.getMonth() === dateObj.getMonth() &&
        aptDate.getFullYear() === dateObj.getFullYear() &&
        (apt.status === "Pending" || apt.status === "Confirmed")
      );
    });

    const maxLimit = doc.maxPatientsPerDay || 15;
    if (appointmentsOnDate.length >= maxLimit) {
      return { isAvailable: false, reason: "limit_hit", count: appointmentsOnDate.length, limit: maxLimit };
    }

    let isScheduled = false;
    if (doc.scheduleType === "weekly") {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const selectedDayName = daysOfWeek[dateObj.getDay()];
      isScheduled = doc.availableDays && doc.availableDays.includes(selectedDayName);
    } else if (doc.scheduleType === "monthly") {
      const dayOfMonth = dateObj.getDate().toString();
      isScheduled = doc.availableDays && doc.availableDays.includes(dayOfMonth);
    } else {
      isScheduled = true;
    }

    if (!isScheduled) {
      return { isAvailable: false, reason: "absent", count: appointmentsOnDate.length, limit: maxLimit };
    }

    return { isAvailable: true, reason: "available", count: appointmentsOnDate.length, limit: maxLimit };
  };

  // Check if a time slot is already booked for a doctor on a specific date
  const isSlotBooked = (docId: string, dateStr: string, slot: string) => {
    if (!dateStr || !slot) return false;
    const dateObj = new Date(dateStr);
    return appointments.some((apt) => {
      const aptDate = new Date(apt.date);
      return (
        apt.doctor?._id === docId &&
        apt.timeSlot === slot &&
        aptDate.getDate() === dateObj.getDate() &&
        aptDate.getMonth() === dateObj.getMonth() &&
        aptDate.getFullYear() === dateObj.getFullYear() &&
        (apt.status === "Pending" || apt.status === "Confirmed")
      );
    });
  };

  // Generate hourly time slots between doctor's startTime and endTime
  const generateDoctorSlots = (doc: any) => {
    if (!doc || !doc.startTime || !doc.endTime) {
      return ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    }

    const parseTimeToMinutes = (timeStr: string) => {
      const cleaned = timeStr.trim().toUpperCase();
      const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
      if (!match) return null;
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];

      if (ampm) {
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const startMin = parseTimeToMinutes(doc.startTime);
    const endMin = parseTimeToMinutes(doc.endTime);

    if (startMin === null || endMin === null || startMin >= endMin) {
      return ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    }

    const slots = [];
    let currentMin = startMin;
    while (currentMin + 60 <= endMin) {
      const hour24 = Math.floor(currentMin / 60);
      const min = currentMin % 60;
      
      const ampm = hour24 >= 12 ? "PM" : "AM";
      let displayHour = hour24 % 12;
      if (displayHour === 0) displayHour = 12;
      
      const minStr = min.toString().padStart(2, "0");
      const hourStr = displayHour.toString().padStart(2, "0");
      slots.push(`${hourStr}:${minStr} ${ampm}`);
      
      currentMin += 60;
    }

    return slots;
  };

  // Calculate the queue position (how many patients are ahead) for a given appointment
  const getQueuePosition = (apt: any) => {
    if (!apt || !apt.doctor || !apt.date || !apt.timeSlot) return 0;
    
    const docId = apt.doctor._id || apt.doctor;
    const aptDateStr = new Date(apt.date).toDateString();
    
    const sameDayAppts = appointments.filter((a) => {
      const aDocId = a.doctor?._id || a.doctor;
      const aDateStr = new Date(a.date).toDateString();
      return (
        aDocId === docId &&
        aDateStr === aptDateStr &&
        (a.status === "Pending" || a.status === "Confirmed")
      );
    });

    const timeToMinutes = (timeStr: string) => {
      const cleaned = timeStr.trim().toUpperCase();
      const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
      if (!match) return 9999;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm) {
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    sameDayAppts.sort((a, b) => timeToMinutes(a.timeSlot) - timeToMinutes(b.timeSlot));

    const index = sameDayAppts.findIndex((a) => a._id === apt._id);
    return index >= 0 ? index : 0;
  };

  // Compute hypothetical queue position for a selected date and slot before booking
  const getHypotheticalQueuePosition = (docId: string, dateStr: string, slotStr: string) => {
    if (!docId || !dateStr || !slotStr) return { ahead: 0, total: 0 };

    const checkDateStr = new Date(dateStr).toDateString();

    const sameDayAppts = appointments.filter((a) => {
      const aDocId = a.doctor?._id || a.doctor;
      const aDateStr = new Date(a.date).toDateString();
      return (
        aDocId === docId &&
        aDateStr === checkDateStr &&
        (a.status === "Pending" || a.status === "Confirmed")
      );
    });

    const timeToMinutes = (timeStr: string) => {
      const cleaned = timeStr.trim().toUpperCase();
      const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
      if (!match) return 9999;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm) {
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const targetMinutes = timeToMinutes(slotStr);
    const ahead = sameDayAppts.filter((a) => timeToMinutes(a.timeSlot) < targetMinutes).length;
    
    return { ahead, total: sameDayAppts.length };
  };

  // Generate calendar days for the currentMonth view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  return (
    <PageWrapper
      title="Book Appointment"
      description="Schedule consultation slot with our specialized clinic practitioners."
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Tab Layout of Department Options */}
        <DepartmentTabs
          departments={departments}
          selectedDeptId={selectedDeptId}
          onTabChange={handleTabChange}
        />

        {/* Practitioners cards of the selected department tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc._id}
              doc={doc}
              bookingDoctorId={bookingDoctorId}
              selectedDeptId={selectedDeptId}
              onBookClick={(docId, deptId) => {
                setBookingDoctorId(docId);
                setBookingDeptId(deptId);
              }}
            />
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-border border-dashed rounded-2xl bg-card">
              No practitioners found under this department.
            </div>
          )}
        </div>

        {/* Sliding Right-side Booking Sheet Modal */}
        <BookingSheet
          bookingDoctorId={bookingDoctorId}
          doctors={doctors}
          appointments={appointments}
          user={user}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          bookingSlot={bookingSlot}
          setBookingSlot={setBookingSlot}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          calendarDays={calendarDays}
          getDateStatus={getDateStatus}
          isSlotBooked={isSlotBooked}
          generateDoctorSlots={generateDoctorSlots}
          getHypotheticalQueuePosition={getHypotheticalQueuePosition}
          getQueuePosition={getQueuePosition}
          onSubmit={handleBookAppointment}
          onClose={() => {
            setBookingDoctorId("");
            setBookingDate("");
            setBookingSlot("");
          }}
        />

        {/* Payment checkout simulation */}
        <PaymentSimulator 
          paymentData={paymentData}
          onCancel={() => setPaymentData(null)}
          onSubmit={handlePaymentConfirm}
        />
      </div>
    </PageWrapper>
  );
}

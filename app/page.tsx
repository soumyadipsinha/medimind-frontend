"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { Activity, LogOut, Sun, Moon, Palette, Plus, Upload, XCircle, Settings, Users, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";

// Import custom subcomponents
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import ChatSection from "./components/ChatSection";
import PaymentSimulator from "./app/patients/components/PaymentSimulator";
import AdminPortal from "./app/admin/components/AdminPortal";
import DoctorPortal from "./app/doctors/components/DoctorPortal";
import PatientPortal from "./app/patients/components/PatientPortal";

import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/services/department.services";
import { getClinicServices, createClinicService, updateClinicService, deleteClinicService } from "@/services/clinicService.services";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor as serviceDeleteDoctor } from "@/services/doctor.services";
import { getPatients, getPatientLogs } from "@/services/patient.services";
import { getAppointments, bookAppointment, updateAppointmentStatus } from "@/services/appointment.services";
import { getPrescriptions, createPrescription } from "@/services/prescription.services";
import { getReports, bookLabTest, uploadReportPDF } from "@/services/report.services";
import { getChatUsers, getChatMessages, markChatAsSeen } from "@/services/chat.services";
import { verifyPayment } from "@/services/payment.services";
import { getAdminDashboardMetrics } from "@/services/analytics.services";

export default function Home() {
  const { user, login, logout, loading, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Navigation states
  const [activePortalTab, setActivePortalTab] = useState("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginRole, setLoginRole] = useState<"patient" | "doctor" | "admin">("patient");

  // Clinic Listings & States
  const [departments, setDepartments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ metrics: {}, departmentAnalytics: [] });

  // Patient Booking forms states
  const [bookingDeptId, setBookingDeptId] = useState("");
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  
  // Doctor prescription form
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: "", diagnosis: "", advice: "", 
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    recommendedTests: [] as string[], followUpDate: ""
  });

  // Department Modal states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: "", name: "", description: "", status: "Active" });

  // Service Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: "", name: "", department: "", price: "", description: "", reportDeliveryTime: "24 Hours" });

  // Doctor Modal states
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    id: "", name: "", email: "", password: "", qualification: "", specialization: "", 
    experience: "", registrationNumber: "", consultationFee: "", startTime: "09:00", endTime: "17:00", maxPatientsPerDay: "15", bio: "", avatarUrl: ""
  });

  // Report Upload states
  const [reportUploadId, setReportUploadId] = useState<string | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportNotes, setReportNotes] = useState("");

  // Chat & Socket
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [socket, setSocket] = useState<any>(null);

  // Search Patient Log
  const [selectedPatientLog, setSelectedPatientLog] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Payment checkout overlay
  const [paymentData, setPaymentData] = useState<any | null>(null);

  // Load backend data
  useEffect(() => {
    if (user) {
      // Redirect to correct subfolder route
      if (user.role === "admin") router.push("/app/admin");
      else if (user.role === "doctor") router.push("/app/doctors");
      else if (user.role === "patient") router.push("/app/patients");

      fetchDepartments();
      fetchServices();
      fetchDoctors();
      fetchAppointments();
      fetchPrescriptions();
      fetchReports();
      if (user.role === "admin") {
        fetchAdminAnalytics();
        fetchPatients();
      }
      fetchChatUsers();

      // Socket init
      const tokenCookie = document.cookie.split("accessToken=")[1]?.split(";")[0];
      const sk = io({ auth: { token: tokenCookie } });
      setSocket(sk);

      sk.on("receive_message", (message: any) => {
        setMessages((prev) => [...prev, message]);
      });

      sk.on("message_sent", (message: any) => {
        setMessages((prev) => [...prev, message]);
      });

      sk.on("error", (err: any) => {
        alert(err.message || "Chat error");
      });

      return () => {
        sk.disconnect();
      };
    }
  }, [user, router]);

  // Fetch functions
  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchServices = async () => {
    try {
      const data = await getClinicServices();
      setServices(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchPrescriptions = async () => {
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchAdminAnalytics = async () => {
    try {
      const data = await getAdminDashboardMetrics();
      setAnalytics(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchChatUsers = async () => {
    try {
      const data = await getChatUsers();
      setChatUsers(data);
    } catch (err: any) {
      console.error(err);
    }
  };
  const fetchMessages = async (partnerId: string) => {
    try {
      const data = await getChatMessages(partnerId);
      setMessages(data.messages || []);
      // Mark seen
      await markChatAsSeen(partnerId);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Auth Modal trigger
  const handleEnterPortal = (role?: "patient" | "doctor" | "admin", isRegister?: boolean) => {
    if (role) setLoginRole(role);
    setAuthTab(isRegister ? "register" : "login");
    setShowAuthModal(true);
  };

  // CRUD Actions
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (deptForm.id) {
        await updateDepartment(deptForm.id, deptForm);
      } else {
        await createDepartment(deptForm);
      }
      fetchDepartments();
      setShowDeptModal(false);
      setDeptForm({ id: "", name: "", description: "", status: "Active" });
    } catch (err: any) {
      alert(err.message || "Error saving department");
    }
  };

  const handleDeptDelete = async (id: string) => {
    if (confirm("Delete this department?")) {
      try {
        await deleteDepartment(id);
        fetchDepartments();
      } catch (err: any) {
        alert(err.message || "Error deleting department");
      }
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (serviceForm.id) {
        await updateClinicService(serviceForm.id, serviceForm);
      } else {
        await createClinicService(serviceForm);
      }
      fetchServices();
      setShowServiceModal(false);
      setServiceForm({ id: "", name: "", department: "", price: "", description: "", reportDeliveryTime: "24 Hours" });
    } catch (err: any) {
      alert(err.message || "Error saving service");
    }
  };

  const handleServiceDelete = async (id: string) => {
    if (confirm("Delete this test/service?")) {
      try {
        await deleteClinicService(id);
        fetchServices();
      } catch (err: any) {
        alert(err.message || "Error deleting service");
      }
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (doctorForm.id) {
        await updateDoctor(doctorForm.id, doctorForm);
      } else {
        await createDoctor(doctorForm);
      }
      fetchDoctors();
      setShowDoctorModal(false);
      setDoctorForm({
        id: "", name: "", email: "", password: "", qualification: "", specialization: "", 
        experience: "", registrationNumber: "", consultationFee: "", startTime: "09:00", endTime: "17:00", maxPatientsPerDay: "15", bio: "", avatarUrl: ""
      });
    } catch (err: any) {
      alert(err.message || "Error saving doctor");
    }
  };

  const handleDoctorDelete = async (id: string) => {
    if (confirm("Delete this doctor?")) {
      try {
        await serviceDeleteDoctor(id);
        fetchDoctors();
      } catch (err: any) {
        alert(err.message || "Error deleting doctor");
      }
    }
  };

  // Appointment Actions
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await bookAppointment({
        doctorId: bookingDoctorId,
        departmentId: bookingDeptId,
        date: bookingDate,
        timeSlot: bookingSlot
      });
      fetchAppointments();
      setPaymentData({
        amount: doctors.find((d) => d._id === bookingDoctorId)?.consultationFee || 150,
        type: "Appointment",
        referenceId: data.appointment._id
      });
      setBookingDoctorId("");
      setBookingDate("");
      setBookingSlot("");
    } catch (err: any) {
      alert(err.message || "Booking conflict / error");
    }
  };

  const handleAppointmentStatus = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Error updating appointment status");
    }
  };

  // Test Booking
  const handleBookTest = async (testId: string, price: number) => {
    try {
      const data = await bookLabTest(testId);
      fetchReports();
      setPaymentData({
        amount: price,
        type: "Test",
        referenceId: data.report._id
      });
    } catch (err: any) {
      alert(err.message || "Error booking test");
    }
  };

  // Confirm simulated Payment
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
      alert("Payment verified successfully!");
      setPaymentData(null);
      fetchAppointments();
      fetchReports();
      if (user?.role === "admin") fetchAdminAnalytics();
    } catch (err: any) {
      alert(err.message || "Payment verification failed");
    }
  };

  // Prescription submit
  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPrescription(prescriptionForm);
      fetchPrescriptions();
      fetchAppointments();
      setPrescriptionForm({
        appointmentId: "", diagnosis: "", advice: "", 
        medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
        recommendedTests: [], followUpDate: ""
      });
      alert("Prescription generated!");
    } catch (err: any) {
      alert(err.message || "Error creating prescription");
    }
  };

  // Report PDF upload
  const handleReportUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportUploadId || !reportFile) return;
    
    const formData = new FormData();
    formData.append("file", reportFile);
    formData.append("notes", reportNotes);

    try {
      await uploadReportPDF(reportUploadId, formData);
      fetchReports();
      setReportUploadId(null);
      setReportFile(null);
      setReportNotes("");
      alert("Report complete.");
    } catch (err: any) {
      alert(err.message || "Error uploading report");
    }
  };

  // Chat message submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput || !activeChatUser || !socket) return;
    socket.emit("send_message", {
      receiverId: activeChatUser._id,
      content: chatInput
    });
    setChatInput("");
  };

  // Patient logs query
  const handleSelectPatientLog = async (id: string) => {
    try {
      const data = await getPatientLogs(id);
      setSelectedPatientLog(data);
    } catch (err: any) {
      alert(err.message || "Error fetching patient logs");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Navbar Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-foreground">MediMind</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <div className="flex items-center gap-1.5 border border-border rounded-lg p-1 bg-card">
              {(["gray", "blue", "green"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setTheme({ mode: theme.mode, color: c })}
                  className={`size-5 rounded-full ${
                    c === "gray" ? "bg-slate-500" : c === "blue" ? "bg-blue-500" : "bg-emerald-500"
                  } ring-offset-2 ring-primary ${theme.color === c ? "ring-2 scale-110" : ""}`}
                />
              ))}
              <div className="w-px h-4 bg-border mx-1" />
              <button 
                onClick={() => setTheme({ color: theme.color, mode: theme.mode === "dark" ? "light" : "dark" })}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                {theme.mode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>

            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              >
                <LogOut className="size-3.5" /> Logout
              </button>
            ) : (
              <button
                onClick={() => handleEnterPortal("patient", false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
              >
                Enter Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      {!user ? (
        <LandingPage onEnterPortal={handleEnterPortal} />
      ) : (
        <div className="flex-grow flex">
          {/* Side Menu */}
          <aside className="w-64 border-r border-border bg-card/30 flex flex-col justify-between p-4 hidden md:flex">
            <div className="flex flex-col gap-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                {user.role} workspace
              </div>
              <nav className="flex flex-col gap-1">
                <button onClick={() => setActivePortalTab("dashboard")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <Activity className="size-4" /> Dashboard
                </button>
                {user.role === "admin" && (
                  <>
                    <button onClick={() => setActivePortalTab("departments")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "departments" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Plus className="size-4" /> Departments</button>
                    <button onClick={() => setActivePortalTab("services")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "services" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Settings className="size-4" /> Clinic Services</button>
                    <button onClick={() => setActivePortalTab("doctors")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "doctors" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Plus className="size-4" /> Doctors</button>
                    <button onClick={() => setActivePortalTab("patients")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "patients" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Users className="size-4" /> Patients</button>
                  </>
                )}
                {user.role === "patient" && (
                  <>
                    <button onClick={() => setActivePortalTab("book-appointment")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "book-appointment" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Activity className="size-4" /> Book Appointment</button>
                    <button onClick={() => setActivePortalTab("book-test")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "book-test" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Plus className="size-4" /> Book Lab Test</button>
                  </>
                )}
                <button onClick={() => setActivePortalTab("chat")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePortalTab === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><MessageCircle className="size-4" /> Live Chat</button>
              </nav>
            </div>
          </aside>

          {/* Core Panel Content */}
          <main className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
            {user.role === "admin" && (
              <AdminPortal 
                activeTab={activePortalTab}
                analytics={analytics}
                appointments={appointments}
                reports={reports}
                departments={departments}
                services={services}
                doctors={doctors}
                patients={patients}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedPatientLog={selectedPatientLog}
                onSelectPatientLog={handleSelectPatientLog}
                onAppointmentStatus={handleAppointmentStatus}
                onSetReportUploadId={setReportUploadId}
                onOpenDeptModal={(dept) => {
                  if (dept) setDeptForm({ id: dept._id, name: dept.name, description: dept.description, status: dept.status });
                  else setDeptForm({ id: "", name: "", description: "", status: "Active" });
                  setShowDeptModal(true);
                }}
                onDeptDelete={handleDeptDelete}
                onOpenServiceModal={(ser) => {
                  if (ser) setServiceForm({ id: ser._id, name: ser.name, department: ser.department?._id || "", price: ser.price.toString(), description: ser.description, reportDeliveryTime: ser.reportDeliveryTime });
                  else setServiceForm({ id: "", name: "", department: "", price: "", description: "", reportDeliveryTime: "24 Hours" });
                  setShowServiceModal(true);
                }}
                onServiceDelete={handleServiceDelete}
                onOpenDoctorModal={(doc) => {
                  if (doc) setDoctorForm({ id: doc._id, name: doc.user?.name || "", email: doc.user?.email || "", password: "", qualification: doc.qualification, specialization: doc.specialization, experience: doc.experience.toString(), registrationNumber: doc.registrationNumber, consultationFee: doc.consultationFee.toString(), startTime: doc.startTime, endTime: doc.endTime, maxPatientsPerDay: doc.maxPatientsPerDay.toString(), bio: doc.bio || "", avatarUrl: doc.user?.avatarUrl || "" });
                  else setDoctorForm({ id: "", name: "", email: "", password: "", qualification: "", specialization: "", experience: "", registrationNumber: "", consultationFee: "", startTime: "09:00", endTime: "17:00", maxPatientsPerDay: "15", bio: "", avatarUrl: "" });
                  setShowDoctorModal(true);
                }}
                onDoctorDelete={handleDoctorDelete}
              />
            )}

            {user.role === "doctor" && (
              <DoctorPortal 
                appointments={appointments}
                prescriptionForm={prescriptionForm}
                setPrescriptionForm={setPrescriptionForm}
                onSubmitPrescription={handlePrescriptionSubmit}
              />
            )}

            {user.role === "patient" && (
              <PatientPortal 
                activeTab={activePortalTab}
                appointments={appointments}
                prescriptions={prescriptions}
                reports={reports}
                departments={departments}
                doctors={doctors}
                services={services}
                bookingDeptId={bookingDeptId}
                setBookingDeptId={setBookingDeptId}
                bookingDoctorId={bookingDoctorId}
                setBookingDoctorId={setBookingDoctorId}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                bookingSlot={bookingSlot}
                setBookingSlot={setBookingSlot}
                onSubmitAppointment={handleBookAppointment}
                onBookTest={handleBookTest}
              />
            )}

            {activePortalTab === "chat" && (
              <ChatSection 
                chatUsers={chatUsers}
                activeChatUser={activeChatUser}
                setActiveChatUser={setActiveChatUser}
                messages={messages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                onSendMessage={handleSendMessage}
                onFetchMessages={fetchMessages}
                currentUser={user}
              />
            )}
          </main>
        </div>
      )}

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          defaultRole={loginRole}
          defaultTab={authTab}
          onLoginSuccess={login}
        />
      )}

      {/* Department CRUD Overlay */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDeptSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground">{deptForm.id ? "Edit Department" : "Add New Department"}</h3>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Department Name</label>
              <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Description</label>
              <textarea required value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none h-20" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Status</label>
              <select value={deptForm.status} onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Service CRUD Overlay */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleServiceSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground">{serviceForm.id ? "Edit Lab Service" : "Add Lab Service"}</h3>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Test Name</label>
              <input type="text" required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Assigned Department</label>
              <select required value={serviceForm.department} onChange={(e) => setServiceForm({ ...serviceForm, department: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none">
                <option value="">Select department...</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Price ($)</label>
                <input type="number" required value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Delivery Window</label>
                <input type="text" placeholder="24 Hours" required value={serviceForm.reportDeliveryTime} onChange={(e) => setServiceForm({ ...serviceForm, reportDeliveryTime: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Description</label>
              <textarea required value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none h-16" />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Doctor CRUD Overlay */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDoctorSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-lg shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-foreground">{doctorForm.id ? "Edit Doctor Profile" : "Register Doctor Account"}</h3>
            
            <div className="text-xs font-bold uppercase tracking-wider text-primary">1. Credentials</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                <input type="text" required value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Email</label>
                <input type="email" required value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
            </div>
            {!doctorForm.id && (
              <div>
                <label className="text-xs font-bold text-muted-foreground">Password</label>
                <input type="password" required value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
            )}

            <div className="text-xs font-bold uppercase tracking-wider text-primary mt-2">2. Specialization & Availability</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Specialization</label>
                <input type="text" required placeholder="Cardiology" value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Qualification</label>
                <input type="text" required placeholder="MD, MBBS" value={doctorForm.qualification} onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Exp (Years)</label>
                <input type="number" required value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Reg Number</label>
                <input type="text" required placeholder="MC12345" value={doctorForm.registrationNumber} onChange={(e) => setDoctorForm({ ...doctorForm, registrationNumber: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Consultation Fee ($)</label>
                <input type="number" required value={doctorForm.consultationFee} onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Start Time</label>
                <input type="text" required value={doctorForm.startTime} onChange={(e) => setDoctorForm({ ...doctorForm, startTime: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">End Time</label>
                <input type="text" required value={doctorForm.endTime} onChange={(e) => setDoctorForm({ ...doctorForm, endTime: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Max Daily Patients</label>
                <input type="number" required value={doctorForm.maxPatientsPerDay} onChange={(e) => setDoctorForm({ ...doctorForm, maxPatientsPerDay: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Doctor Bio</label>
              <textarea value={doctorForm.bio} onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg text-sm text-foreground outline-none h-16" />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setShowDoctorModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Register Doctor</button>
            </div>
          </form>
        </div>
      )}

      {/* Lab Report Upload Overlay */}
      {reportUploadId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReportUploadSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground">Upload Finished Lab PDF</h3>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Select PDF / Report Image</label>
              <input 
                type="file" 
                required 
                onChange={(e) => setReportFile(e.target.files ? e.target.files[0] : null)}
                className="w-full bg-muted border border-border p-2 rounded-lg mt-1 text-xs text-foreground outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Lab Technician Notes</label>
              <textarea 
                placeholder="e.g. CBC counts are normal, thyroid slightly elevated"
                value={reportNotes} 
                onChange={(e) => setReportNotes(e.target.value)}
                className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none h-20"
              />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setReportUploadId(null)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Complete Report</button>
            </div>
          </form>
        </div>
      )}

      {/* Simulated Razorpay Checkout Modal */}
      <PaymentSimulator 
        paymentData={paymentData}
        onCancel={() => setPaymentData(null)}
        onSubmit={handlePaymentConfirm}
      />
    </div>
  );
}
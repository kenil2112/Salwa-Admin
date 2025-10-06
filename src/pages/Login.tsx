import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MutableRefObject
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
const VERIFY_ID_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/SuperAdmin/VerifySuperAdminByIDNumber";
const VERIFY_MOBILE_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/SuperAdmin/VerifySuperAdminMobile";
const VERIFY_OTP_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/SuperAdmin/SuperAdminVerifyOtp";
const SET_PASSWORD_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/SuperAdmin/SetSuperAdminPasswordByMobile";
const LOGIN_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/SuperAdmin/SuperAdminLogin";

type Step = "verifyId" | "mobile" | "otp" | "setPassword" | "success" | "login";

type VerifyResponse = {
  status: number;
  message: string;
  superAdminId: number;
  adminName: string;
  adminMobileNo: string;
  isPasswordSet: 0 | 1;
  isOtpVerify: 0 | 1;
  isMobileNoVerify: boolean;
};

type BasicApiResponse = {
  status?: number;
  message?: string;
};

const COUNTRY_OPTIONS = [
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+91", label: "India (+91)" },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>("verifyId");
  const [idNumber, setIdNumber] = useState("");

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [creatingPassword, setCreatingPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [mobileDialCode, setMobileDialCode] = useState(COUNTRY_OPTIONS[0].code);
  const [mobileLocalNumber, setMobileLocalNumber] = useState("");
  const [mobileForOtp, setMobileForOtp] = useState("");

  const [otpValues, setOtpValues] = useState<string[]>(() => Array(6).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]) as MutableRefObject<Array<HTMLInputElement | null>>;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const initialId = (location.state as { idNumber?: string } | null)?.idNumber;
    if (initialId) {
      setIdNumber(initialId);
      setStep("login");
    }
  }, [location.state]);

  const countryOptions = useMemo(() => {
    const map = new Map(COUNTRY_OPTIONS.map((option) => [option.code, option]));
    if (mobileDialCode && !map.has(mobileDialCode)) {
      map.set(mobileDialCode, { code: mobileDialCode, label: `${mobileDialCode}` });
    }
    return Array.from(map.values());
  }, [mobileDialCode]);



  const applyMobileFromVerification = (raw?: string) => {
    if (!raw) {
      return;
    }
    const cleaned = raw.replace(/[^0-9+]/g, "");
    if (!cleaned) {
      return;
    }
    const knownOption = COUNTRY_OPTIONS.find((option) => cleaned.startsWith(option.code));
    if (knownOption) {
      setMobileDialCode(knownOption.code);
      setMobileLocalNumber(cleaned.slice(knownOption.code.length));
      return;
    }
    const match = cleaned.match(/^(\+\d{1,3})(\d{6,})$/);
    if (match) {
      setMobileDialCode(match[1]);
      setMobileLocalNumber(match[2]);
      return;
    }
    if (cleaned.startsWith("+")) {
      setMobileDialCode(cleaned.slice(0, 4));
      setMobileLocalNumber(cleaned.slice(1));
      return;
    }
    setMobileLocalNumber(cleaned);
  };

  const readResponsePayload = async (response: Response) => {
    const raw = await response.text();
    if (!raw) {
      return "";
    }
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  const verifyIdViaApi = async (rawId: string) => {
    const trimmed = rawId.trim();
    if (!trimmed) {
      throw new Error("Please enter your ID / IQAMA number.");
    }

    const response = await fetch(VERIFY_ID_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ idNumber: trimmed }),
    });

    if (!response.ok) {
      const payload = await readResponsePayload(response);
      const message = typeof payload === "string" ? payload : payload?.message;
      throw new Error(message || "Unable to verify ID number. Please try again.");
    }

    const data = (await response.json()) as VerifyResponse;
    if (data.status !== 200) {
      throw new Error(data.message ?? "Unable to verify ID number.");
    }
    return data;
  };

  const verifyMobileViaApi = async (mobileNumber: string) => {
    const response = await fetch(VERIFY_MOBILE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({ mobileNumber }),
    });

    const payload = await readResponsePayload(response);
    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.message;
      throw new Error(message || "Unable to verify mobile number.");
    }

    if (typeof payload === "object" && payload && "status" in payload && payload.status !== 200) {
      throw new Error((payload as BasicApiResponse).message || "Unable to verify mobile number.");
    }

    const message =
      (typeof payload === "object" && payload && "message" in payload && payload.message) ||
      (typeof payload === "string" && payload) ||
      "Mobile number verified.";

    return message;
  };

  const verifyOtpViaApi = async (mobile: string, otp: string) => {
    const response = await fetch(VERIFY_OTP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({ mobileNo: mobile, otp }),
    });

    const payload = await readResponsePayload(response);
    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.message;
      throw new Error(message || "Unable to verify OTP.");
    }

    if (typeof payload === "object" && payload && "status" in payload && payload.status !== 200) {
      throw new Error((payload as BasicApiResponse).message || "Unable to verify OTP.");
    }

    const message =
      (typeof payload === "object" && payload && "message" in payload && payload.message) ||
      (typeof payload === "string" && payload) ||
      "OTP verified successfully.";

    return message;
  };

  const setPasswordViaApi = async (id: string, passwordValue: string, confirmValue: string) => {
    const response = await fetch(SET_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
      },
      body: JSON.stringify({ idNumber: id, password: passwordValue, confirmPassword: confirmValue }),
    });

    const payload = await readResponsePayload(response);
    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.message;
      throw new Error(message || "Unable to set password.");
    }

    if (typeof payload === "object" && payload && "status" in payload && payload.status !== 200) {
      throw new Error((payload as BasicApiResponse).message || "Unable to set password.");
    }

    const message =
      (typeof payload === "object" && payload && "message" in payload && payload.message) ||
      (typeof payload === "string" && payload) ||
      "Password set successfully.";

    return message;
  };

  const loginViaApi = async (id: string, passwordValue: string) => {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
      },
      body: JSON.stringify({ idNumber: id, password: passwordValue }),
    });

    const payload = await readResponsePayload(response);
    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.message;
      throw new Error(message || "Login failed.");
    }

    if (typeof payload === "object" && payload && "status" in payload && payload.status !== 200) {
      throw new Error((payload as BasicApiResponse).message || "Login failed.");
    }

    const token =
      (typeof payload === "object" && payload && "token" in payload && payload.token) ||
      (typeof payload === "string" && payload) ||
      `token-${Date.now()}`;

    return String(token);
  };

  const resetOtpInputs = () => {
    setOtpValues(Array(6).fill(""));
    otpRefs.current.forEach((input) => input?.blur());
  };

  const goToStep = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setVerifyLoading(true);
    try {
      const data = await verifyIdViaApi(idNumber);
      applyMobileFromVerification(data.adminMobileNo);
      const readyForLogin = data.isPasswordSet === 1 && data.isOtpVerify === 1 && data.isMobileNoVerify;

      if (readyForLogin) {
        goToStep("login");
        showToast("ID verified. Please enter your password to continue.", "success");
      } else {
        const sanitized = data.adminMobileNo?.replace(/[^0-9]/g, "");
        if (sanitized) {
          setMobileForOtp(sanitized);
        }
        goToStep("mobile");
        showToast("ID verified. Continue with mobile verification.", "info");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to verify ID number.", "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleMobileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const digits = mobileLocalNumber.replace(/\D/g, "");
    if (!digits) {
      showToast("Please enter your mobile number.", "error");
      return;
    }

    const sanitizedDial = mobileDialCode.replace(/\D/g, "");
    const requestValue = `${sanitizedDial}${digits}`;

    setMobileLoading(true);
    try {
      const message = await verifyMobileViaApi(requestValue);
      setMobileForOtp(requestValue);
      resetOtpInputs();
      goToStep("otp");
      showToast(message, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to verify mobile number.", "error");
    } finally {
      setMobileLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "");
    const updated = [...otpValues];
    updated[index] = sanitized.slice(-1);
    setOtpValues(updated);

    if (sanitized && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) {
      return;
    }
    const updated = [...otpValues];
    for (let i = 0; i < updated.length; i += 1) {
      updated[i] = pasted[i] ?? "";
    }
    setOtpValues(updated);
    const focusIndex = Math.min(pasted.length, updated.length - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otp = otpValues.join("");

    if (otp.length !== 6) {
      showToast("Please enter the 6-digit OTP.", "error");
      return;
    }

    if (!mobileForOtp) {
      showToast("Mobile number missing. Please verify again.", "error");
      goToStep("mobile");
      return;
    }

    setOtpLoading(true);
    try {
      const message = await verifyOtpViaApi(mobileForOtp, otp);
      goToStep("setPassword");
      showToast(message, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to verify OTP.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    const trimmedId = idNumber.trim();
    if (!trimmedId) {
      showToast("ID number missing. Please start again.", "error");
      goToStep("verifyId");
      return;
    }

    setCreatingPassword(true);
    try {
      const message = await setPasswordViaApi(trimmedId, newPassword, confirmPassword);
      setLoginPassword(newPassword);
      goToStep("success");
      showToast(message, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to set password.", "error");
    } finally {
      setCreatingPassword(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedId = idNumber.trim();
    if (!trimmedId) {
      showToast("Please enter your ID number.", "error");
      return;
    }
    if (!loginPassword.trim()) {
      showToast("Please enter your password.", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const tokenValue = await loginViaApi(trimmedId, loginPassword.trim());
      login(tokenValue);
      showToast("Login successful.", "success");
      const redirectPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Login failed.", "error");
    } finally {
      setLoginLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 font-sans">
      <div className="flex flex-col md:flex-row w-full h-auto md:h-screen">

        <ArtworkPanel />
        <div className="w-full md:flex-1 flex flex-col justify-center items-center px-4 md:px-6 py-12 md:py-0">

          <div className="w-full max-w-md space-y-12">
            <header className="space-y-4 text-left">
              <h1 className="text-4xl font-semibold text-[#070B68]">Login</h1>
              <p className="text-lg text-gray-500">
                {step === "verifyId"
                  ? "Access your account to get started today."
                  : step === "mobile"
                    ? "Verify your registered mobile number."
                    : step === "otp"
                      ? "Enter the OTP sent to your mobile."
                      : step === "setPassword"
                        ? "Create your password to finish setup."
                        : step === "success"
                          ? "Your password has been set successfully."
                          : "Sign in with your ID number and password."}
              </p>
            </header>

            {step === "verifyId" && (
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <InputField
                  id="idNumber"
                  label="ID Number / IQAMA Number"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  placeholder="ID number / IQAMA number"
                  hideLabel
                  inputClassName="placeholder:text-[#A0A3BD]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="w-full rounded-[18px] bg-[#070B68] py-4 text-lg font-semibold text-white shadow-[0_20px_40px_rgba(7,11,104,0.25)] transition hover:bg-[#030447] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#070B68]/60 disabled:cursor-not-allowed disabled:bg-[#070B68]/70"
                >
                  {verifyLoading ? "Verifying..." : "Continue"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Already verified?
                  <button
                    type="button"
                    className="ml-2 font-semibold text-primary hover:underline"
                    onClick={() => goToStep("login")}
                  >
                    Go to login
                  </button>
                </p>
              </form>
            )}

            {step === "mobile" && (
              <form onSubmit={handleMobileSubmit} className="space-y-6">
                <InputField
                  id="verified-id"
                  label="ID Number / IQAMA Number"
                  value={idNumber}
                  placeholder="ID number / IQAMA number"
                  readOnly
                  hideLabel
                  inputClassName="bg-[#F7F8FC] text-[#1F1F1F]"
                />
                <label className="block text-left">
                  <span className="sr-only">Registered mobile number</span>
                  <div className="flex overflow-hidden rounded-[18px] border border-[#E4E6EF] bg-white shadow-sm">
                    <select
                      value={mobileDialCode}
                      onChange={(event) => setMobileDialCode(event.target.value)}
                      className="bg-white px-4 text-sm font-medium text-[#070B68] focus:outline-none"
                    >
                      {countryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={mobileLocalNumber}
                      onChange={(event) => setMobileLocalNumber(event.target.value.replace(/\D/g, ""))}
                      placeholder="987 772 299"
                      className="flex-1 border-l border-[#E4E6EF] px-5 py-4 text-base text-[#1F1F1F] placeholder:text-[#A0A3BD] focus:outline-none"
                    />
                  </div>
                </label>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="font-semibold text-[#070B68] hover:underline"
                    onClick={() => goToStep("verifyId")}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={mobileLoading || !mobileLocalNumber}
                    className="rounded-[18px] bg-[#070B68] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(7,11,104,0.25)] transition hover:bg-[#030447] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#070B68]/60 disabled:cursor-not-allowed disabled:bg-[#070B68]/70"
                  >
                    {mobileLoading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-6">

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-3 text-sm text-gray-500">
                    <p>
                      Enter the 6-digit code sent to
                      <span className="ml-1 font-semibold text-primary">{mobileForOtp ? `+${mobileForOtp}` : " your mobile"}</span>.
                    </p>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary hover:underline"
                      onClick={() => showToast("OTP resend feature coming soon.", "info")}
                    >
                      Resend OTP
                    </button>
                  </div>
                  <OtpInputGroup
                    values={otpValues}
                    refs={otpRefs}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handleOtpPaste}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => goToStep("mobile")}
                    >
                      Edit Mobile Number
                    </button>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#030447] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:bg-primary/70"
                    >
                      {otpLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === "setPassword" && (
              <div className="space-y-6">

                <form onSubmit={handleSetPasswordSubmit} className="space-y-6">
                  <InputField
                    id="new-password"
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoFocus
                  />
                  <InputField
                    id="confirm-password"
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => goToStep("otp")}
                    >
                      Back to OTP
                    </button>
                    <button
                      type="submit"
                      disabled={creatingPassword}
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#030447] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:bg-primary/70"
                    >
                      {creatingPassword ? "Saving..." : "Set Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-6 rounded-3xl border border-gray-200 bg-white px-8 py-12 shadow-[0_20px_60px_rgba(7,11,104,0.12)]">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-white">
                    <CheckIcon />
                  </div>
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold text-primary">Successfully Protected</h2>
                    <p className="text-sm text-gray-500">Your password has been set successfully.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#030447]"
                    onClick={() => goToStep("login")}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}

            {step === "login" && (
              <div className="space-y-6">

                <form onSubmit={handleLoginSubmit} className="space-y-2">
                  <InputField
                    id="login-id"
                    label="ID Number / IQAMA Number"
                    value={idNumber}
                    disabled
                    onChange={(event) => setIdNumber(event.target.value)}
                  />
                  <InputField
                    id="login-password"
                    label="Password"
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => goToStep("verifyId")}
                    >
                      Verify ID again
                    </button>
                    <button type="button" className="font-semibold text-primary/60 hover:text-primary">
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full rounded-xl bg-primary py-3.5 text-lg font-semibold text-white shadow-[0_20px_40px_rgba(7,11,104,0.25)] transition hover:bg-[#030447] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:bg-primary/70"
                  >
                    {loginLoading ? "Signing in..." : "Login"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



type InputFieldProps = {
  label: string;
  id: string;
  hideLabel?: boolean;
  containerClassName?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const InputField = ({
  label,
  id,
  hideLabel = false,
  containerClassName = "",
  inputClassName = "",
  className = "",
  ...props
}: InputFieldProps) => (
  <label className={`block text-left ${containerClassName}`}>
    <span
      className={
        hideLabel
          ? "sr-only"
          : "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400"
      }
    >
      {label}
    </span>
    <input
      id={id}
      {...props}
      className={
        `w-full rounded-[18px] border border-[#E4E6EF] bg-white px-6 py-4 text-base text-[#1F1F1F] placeholder:text-[#A0A3BD] shadow-[0_12px_40px_rgba(7,11,104,0.08)] outline-none transition focus:border-[#070B68] focus:ring-2 focus:ring-[#070B68]/15 disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD] ${className} ${inputClassName}`
      }
    />
  </label>
);

const OtpInputGroup = ({
  values,
  refs,
  onChange,
  onKeyDown,
  onPaste,
}: {
  values: string[];
  refs: MutableRefObject<Array<HTMLInputElement | null>>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center justify-between gap-2">
    {values.map((value, index) => (
      <input
        key={`otp-${index}`}
        ref={(input) => {
          refs.current[index] = input;
        }}
        value={value}
        onChange={(event) => onChange(index, event.target.value)}
        onKeyDown={(event) => onKeyDown(index, event)}
        onPaste={onPaste}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        autoComplete="one-time-code"
        className="h-14 w-14 rounded-xl border border-gray-200 bg-white text-center text-2xl font-semibold tracking-widest text-primary shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
    ))}
  </div>
);

const ArtworkPanel = () => (
  <div className="w-full md:w-1/2  flex flex-col justify-between p-8 md:p-12 text-white relative">
    <div className="mt-12">

      <img src="/img/leftPanelImg.svg" alt="Left Panel Background"
        className="absolute inset-0 w-full h-full object-cover opacity-1 pointer-events-none" />

      <div className="relative md:absolute inset-0 flex flex-col items-center justify-center z-10">
        <img src="/img/logo.svg" alt="Salwa Logo"
          className="w-[160px] md:w-[320px] md:h-[160px] h-[80px] mb-4" />

      </div>
    </div>

    <div className="relative z-10">
      <p
        className="text-accentGreen text-[16px] md:text-[24px] text-center leading-[20px] md:leading-[28px] font-helveticaMedium">
        Towards a Comprehensive <br /> Healthcare Future
      </p>

      <div className="flex justify-center space-x-4 items-stretch  my-8">
        <a href=""><img src="img/Group 1.svg" alt="App Store" /></a>
        <span className="devider border border-white w-[1px]"></span>
        <a href=""> <img src="img/Group 2.svg" alt="Google Play" /></a>
      </div>

      <p className="text-xs text-white text-center font-HelveticaNowTextRegular opacity-50 text-[14px] ">
        Copyright © 2025 Bridge Health Business Service. All Rights Reserved.
      </p>
    </div>
  </div>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-10 w-10">
    <path fill="currentColor" d="M20.6 31.2 15 25.6l2.8-2.8 2.8 2.8L30.2 16l2.8 2.8Z" />
  </svg>
);

export default Login;




import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, Lock, User, ArrowRight, X, Chrome, ShieldCheck, Phone, Eye, EyeOff } from 'lucide-react';
import {
  AuthRequestError,
  forgotPassword,
  getCurrentUser,
  loginUser,
  registerUser,
  resendRegistrationOtp,
  resetPassword,
  verifyRegistrationOtp,
} from '../services/authService';

interface AuthProps {
  onLogin: (userData: { name: string; email: string }) => void;
  onClose: () => void;
  resetParams?: { uid: string; token: string } | null;
  onResetComplete?: () => void;
  logoSrc?: string;
  initialMode?: 'login' | 'register';
}

type OtpContext = 'register' | 'login' | null;
type FormErrors = Record<string, string>;

const OTP_LENGTH = 6;

const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) return `255${digits.slice(1)}`;
  if (digits.startsWith('255') && digits.length === 12) return digits;
  return '';
};

const isValidEmail = (value: string): boolean => /.+@.+\..+/.test(value.trim());

const mapServerFieldErrors = (errors: Record<string, string>): FormErrors => {
  const mapped: FormErrors = {};
  Object.entries(errors).forEach(([key, value]) => {
    if (key === 'password_confirm') {
      mapped.confirmPassword = value;
      return;
    }
    if (key === 'username') {
      mapped.email = value;
      return;
    }
    mapped[key] = value;
  });
  return mapped;
};

export const Auth: React.FC<AuthProps> = ({ onLogin, onClose, resetParams, onResetComplete, logoSrc, initialMode = 'login' }) => {
  const resolvedLogoSrc = logoSrc || `${import.meta.env.BASE_URL}Logo.png`;
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpContext, setOtpContext] = useState<OtpContext>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ''));
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otpCode = useMemo(() => otpDigits.join(''), [otpDigits]);
  const isLoginOtpOverlay = isOtpMode && otpContext === 'login';
  const isRegisterOtpMode = isOtpMode && otpContext === 'register';

  useEffect(() => {
    if (resetParams) {
      setIsResetMode(true);
      setIsLogin(true);
      setIsOtpMode(false);
      setOtpContext(null);
    }
  }, [resetParams]);

  useEffect(() => {
    if (!isResetMode) {
      setIsLogin(initialMode === 'login');
      if (initialMode === 'register') {
        setIsOtpMode(false);
        setOtpContext(null);
      }
    }
  }, [initialMode, isResetMode]);

  useEffect(() => {
    if (isOtpMode) {
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 60);
    }
  }, [isOtpMode, otpContext]);

  const clearOtpInputs = () => {
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
  };

  const focusField = (field: string) => {
    if (field === 'name') nameInputRef.current?.focus();
    if (field === 'phone') phoneInputRef.current?.focus();
    if (field === 'email') emailInputRef.current?.focus();
    if (field === 'password') passwordInputRef.current?.focus();
    if (field === 'confirmPassword') confirmPasswordInputRef.current?.focus();
    if (field === 'code') otpInputRefs.current[0]?.focus();
  };

  const focusFirstError = (errors: FormErrors) => {
    const order = ['name', 'phone', 'email', 'password', 'confirmPassword', 'code'];
    const first = order.find((key) => errors[key]);
    if (!first) return;
    window.setTimeout(() => focusField(first), 0);
  };

  const resetToLogin = (message = '') => {
    setIsOtpMode(false);
    setOtpContext(null);
    clearOtpInputs();
    setPendingPhone('');
    setPendingEmail('');
    setIsLogin(true);
    if (message) {
      setInfoMessage(message);
    }
  };

  const startOtpFlow = (context: Exclude<OtpContext, null>, nextEmail: string, nextPhone: string, message: string) => {
    setPendingEmail(nextEmail);
    setPendingPhone(nextPhone);
    clearOtpInputs();
    setIsOtpMode(true);
    setOtpContext(context);
    setIsLogin(true);
    setErrorMessage('');
    setFieldErrors({});
    setInfoMessage(message);
  };

  const handleOtpInputChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    const nextDigit = clean ? clean.charAt(clean.length - 1) : '';

    setOtpDigits((prev) => {
      const copy = [...prev];
      copy[index] = nextDigit;
      return copy;
    });

    if (fieldErrors.code) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.code;
        return copy;
      });
    }

    if (nextDigit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, idx) => pasted[idx] || '');
    setOtpDigits(next);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    window.setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
  };

  const applyError = (error: unknown, fallback: string) => {
    if (error instanceof AuthRequestError) {
      const mappedErrors = mapServerFieldErrors(error.fieldErrors || {});
      setFieldErrors(mappedErrors);
      if (Object.keys(mappedErrors).length) {
        focusFirstError(mappedErrors);
      }
      setErrorMessage(error.message || fallback);
      return;
    }

    const message = error instanceof Error ? error.message : fallback;
    setErrorMessage(message);
  };

  const handleOtpKeyDown = async (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      await submitOtpVerification();
    }
  };

  const submitOtpVerification = async () => {
    const localErrors: FormErrors = {};
    const normalizedPhone = normalizePhone(pendingPhone || phone);
    const otpEmail = (pendingEmail || email).trim().toLowerCase();

    if (!otpEmail) localErrors.email = 'Barua pepe ya usajili inahitajika.';
    if (!normalizedPhone) localErrors.phone = 'Namba ya simu ya usajili si sahihi.';
    if (otpCode.length !== OTP_LENGTH) localErrors.code = 'Weka tarakimu 6 za OTP.';

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setErrorMessage('Tafadhali rekebisha sehemu zilizoonyesha hitilafu.');
      focusFirstError(localErrors);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setFieldErrors({});
    try {
      const result = await verifyRegistrationOtp({
        email: otpEmail,
        phone: normalizedPhone,
        code: otpCode,
      });
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      resetToLogin(result.welcomeMessage || 'Hongera! Uthibitisho umekamilika. Sasa ingia.');
    } catch (error) {
      applyError(error, 'Imeshindikana kuthibitisha OTP.');
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async () => {
    const localErrors: FormErrors = {};
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) localErrors.name = 'Weka jina lako.';
    if (!normalizedPhone) localErrors.phone = 'Weka namba sahihi ya simu (mfano: 2557XXXXXXXX).';
    if (!normalizedEmail) {
      localErrors.email = 'Weka barua pepe yako.';
    } else if (!isValidEmail(normalizedEmail)) {
      localErrors.email = 'Barua pepe si sahihi.';
    }
    if (!password) {
      localErrors.password = 'Weka nenosiri.';
    } else if (password.length < 8) {
      localErrors.password = 'Nenosiri liwe na angalau herufi 8.';
    }
    if (!confirmPassword) {
      localErrors.confirmPassword = 'Thibitisha nenosiri lako.';
    } else if (password !== confirmPassword) {
      localErrors.confirmPassword = 'Nenosiri hayalingani.';
    }

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setErrorMessage('Tafadhali jaza taarifa zote sahihi kabla ya kuendelea.');
      focusFirstError(localErrors);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setFieldErrors({});
    try {
      const result = await registerUser({
        name: trimmedName,
        email: normalizedEmail,
        password,
        passwordConfirm: confirmPassword,
        phone: normalizedPhone,
      });
      setPhone(result.phone || normalizedPhone);
      setEmail(result.email || normalizedEmail);
      setShowPassword(false);
      setShowConfirmPassword(false);
      startOtpFlow(
        'register',
        result.email || normalizedEmail,
        result.phone || normalizedPhone,
        result.message || 'Tumekutumia OTP kwenye simu yako. Weka tarakimu 6 kuthibitisha usajili.'
      );
    } catch (error) {
      applyError(error, 'Imeshindikana kusajili.');
    } finally {
      setLoading(false);
    }
  };

  const submitLogin = async () => {
    const localErrors: FormErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      localErrors.email = 'Weka barua pepe yako.';
    } else if (!isValidEmail(normalizedEmail)) {
      localErrors.email = 'Barua pepe si sahihi.';
    }
    if (!password) localErrors.password = 'Weka nenosiri lako.';

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setErrorMessage('Tafadhali rekebisha taarifa za kuingia.');
      focusFirstError(localErrors);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setFieldErrors({});
    try {
      await loginUser({ email: normalizedEmail, password });
      const user = await getCurrentUser();
      onLogin(user);
    } catch (error) {
      if (error instanceof AuthRequestError && error.code === 'verification_required') {
        startOtpFlow(
          'login',
          error.email || normalizedEmail,
          normalizePhone(error.phone || pendingPhone || phone),
          error.message || 'Akaunti yako bado haijathibitishwa. Weka OTP tuliyotuma sasa hivi.'
        );
        return;
      }
      applyError(error, 'Imeshindikana kuingia.');
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordReset = async () => {
    const localErrors: FormErrors = {};
    if (!resetParams) {
      setErrorMessage('Link ya kubadili nenosiri haipo.');
      return;
    }
    if (!password) {
      localErrors.password = 'Weka nenosiri jipya.';
    } else if (password.length < 8) {
      localErrors.password = 'Nenosiri liwe na angalau herufi 8.';
    }
    if (!confirmPassword) {
      localErrors.confirmPassword = 'Thibitisha nenosiri jipya.';
    } else if (password !== confirmPassword) {
      localErrors.confirmPassword = 'Nenosiri hayalingani.';
    }
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setErrorMessage('Tafadhali rekebisha taarifa za nenosiri.');
      focusFirstError(localErrors);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setFieldErrors({});
    try {
      await resetPassword({
        uid: resetParams.uid,
        token: resetParams.token,
        password,
      });
      setInfoMessage('Nenosiri limebadilishwa. Sasa ingia.');
      setIsResetMode(false);
      setPassword('');
      setConfirmPassword('');
      onResetComplete?.();
    } catch (error) {
      applyError(error, 'Imeshindikana kubadili nenosiri.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoginOtpOverlay) {
      return;
    }
    if (isResetMode) {
      await submitPasswordReset();
      return;
    }
    if (isRegisterOtpMode) {
      await submitOtpVerification();
      return;
    }
    if (isLogin) {
      await submitLogin();
      return;
    }
    await submitRegistration();
  };

  const handleGoogleLogin = () => {
    setInfoMessage('');
    setErrorMessage('Google login bado haijaunganishwa. Tumia barua pepe na nenosiri.');
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const localErrors: FormErrors = {};

    if (!normalizedEmail) {
      localErrors.email = 'Weka barua pepe kwanza.';
    } else if (!isValidEmail(normalizedEmail)) {
      localErrors.email = 'Barua pepe si sahihi.';
    }
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setErrorMessage('Weka barua pepe sahihi kabla ya kuendelea.');
      focusFirstError(localErrors);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setFieldErrors({});
    try {
      await forgotPassword(normalizedEmail);
      setInfoMessage('Tumetuma maelekezo ya kubadili nenosiri kwenye barua pepe yako.');
    } catch (error) {
      applyError(error, 'Imeshindikana kutuma link ya kubadili nenosiri.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const resolvedEmail = (pendingEmail || email).trim().toLowerCase();
    const resolvedPhone = normalizePhone(pendingPhone || phone);

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setFieldErrors({});
    try {
      const response = await resendRegistrationOtp({
        email: resolvedEmail,
        phone: resolvedPhone,
      });
      if (response.phone) {
        setPendingPhone(response.phone);
      }
      if (response.email) {
        setPendingEmail(response.email);
      }
      setInfoMessage(response.message || 'OTP mpya imetumwa kwenye simu yako.');
      clearOtpInputs();
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    } catch (error) {
      applyError(error, 'Imeshindikana kutuma OTP tena.');
    } finally {
      setLoading(false);
    }
  };

  const renderOtpBoxes = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {otpDigits.map((digit, index) => (
          <input
            key={`otp-${index}`}
            ref={(node) => {
              otpInputRefs.current[index] = node;
            }}
            type="text"
            value={digit}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            onPaste={handleOtpPaste}
            onChange={(event) => handleOtpInputChange(index, event.target.value)}
            onKeyDown={(event) => {
              void handleOtpKeyDown(index, event);
            }}
            className={`h-12 w-full rounded-lg border text-center text-lg font-black outline-none transition-all ${
              fieldErrors.code
                ? 'border-red-400 bg-red-500/10 text-red-600'
                : 'border-slate-300 bg-white/80 text-slate-900 focus:border-gold-500 dark:border-white/10 dark:bg-black/20 dark:text-white'
            }`}
          />
        ))}
      </div>
      {fieldErrors.code && <p className="text-[11px] font-semibold text-red-500">{fieldErrors.code}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[95vh] flex flex-col bg-white dark:bg-[#0f172a] rounded-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-up">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-gold-500 to-gold-600 opacity-10 dark:opacity-20 pointer-events-none"></div>

        {isLoginOtpOverlay && (
          <div className="absolute top-3 left-1/2 z-20 w-[calc(100%-1.5rem)] -translate-x-1/2">
            <div className="rounded-2xl border border-white/50 bg-white/35 p-4 shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/45">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-700 dark:text-gold-300">Thibitisha Akaunti</p>
              <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Akaunti hii bado haijathibitishwa. Ingiza OTP ya tarakimu 6 tuliyotuma kwenye simu yako.
              </p>
              <div className="mt-3">{renderOtpBoxes()}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void submitOtpVerification();
                  }}
                  disabled={loading}
                  className="rounded-lg bg-primary-950 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-50 dark:bg-gold-500 dark:text-primary-950"
                >
                  Thibitisha OTP
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="rounded-lg border border-gold-500/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gold-700 disabled:opacity-50 dark:text-gold-300"
                >
                  Tuma Tena
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(false);
                    setOtpContext(null);
                    clearOtpInputs();
                    setInfoMessage('Uthibitisho umeahirishwa. Unaweza kuendelea kujaribu kuingia ukihitaji OTP tena.');
                  }}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 disabled:opacity-50 dark:border-white/15 dark:text-slate-300"
                >
                  Funga
                </button>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 pt-8 relative overflow-y-auto">
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-4">
              <img src={resolvedLogoSrc} alt="God Cares 365" className="h-20 w-auto" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {isResetMode ? 'Badili Nenosiri' : isRegisterOtpMode ? 'Thibitisha OTP' : isLogin ? 'Karibu Tena' : 'Jiunge Nasi'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-4">
              {isResetMode
                ? 'Weka nenosiri jipya ili kuendelea'
                : isRegisterOtpMode
                  ? 'Ingiza tarakimu 6 za msimbo uliotumwa kwenye simu yako'
                  : isLogin
                    ? 'Ingia ili uendelee na uchambuzi'
                    : 'Tengeneza akaunti kuanza safari'}
            </p>
          </div>

          <div className="space-y-3">
            {!isResetMode && !isRegisterOtpMode && (
              <>
                {/* Google Login Button */}
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Chrome size={18} className="text-blue-500" />
                  <span>Endelea na Google</span>
                </button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AU EMAIL</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-semibold px-4 py-2 rounded-lg">
                  {errorMessage}
                </div>
              )}
              {infoMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-[11px] font-semibold px-4 py-2 rounded-lg">
                  {infoMessage}
                </div>
              )}
              {!isLogin && !isResetMode && !isRegisterOtpMode && (
                <div className="space-y-1">
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                    <input 
                      ref={nameInputRef}
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Jina Lako" 
                      className={`w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none transition-all text-sm text-slate-900 dark:text-white font-medium ${
                        fieldErrors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/5 focus:border-gold-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.name && <p className="text-[11px] font-semibold text-red-500">{fieldErrors.name}</p>}
                </div>
              )}

              {!isLogin && !isResetMode && !isRegisterOtpMode && (
                <div className="space-y-1">
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                    <input
                      ref={phoneInputRef}
                      type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="Namba ya Simu (mfano: 2557XXXXXXXX)"
                      className={`w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none transition-all text-sm text-slate-900 dark:text-white font-medium ${
                        fieldErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/5 focus:border-gold-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-[11px] font-semibold text-red-500">{fieldErrors.phone}</p>}
                </div>
              )}

              {!isResetMode && !isRegisterOtpMode && (
                <div className="space-y-1">
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                    <input 
                      ref={emailInputRef}
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Barua Pepe" 
                      className={`w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none transition-all text-sm text-slate-900 dark:text-white font-medium ${
                        fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/5 focus:border-gold-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-[11px] font-semibold text-red-500">{fieldErrors.email}</p>}
                </div>
              )}

              {!isRegisterOtpMode && (
                <div className="space-y-1">
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                    <input 
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={isResetMode ? "Nenosiri Jipya" : "Nenosiri"}
                      className={`w-full pl-14 pr-14 py-3 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none transition-all text-sm text-slate-900 dark:text-white font-medium ${
                        fieldErrors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/5 focus:border-gold-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold-500 transition-colors"
                      aria-label={showPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-[11px] font-semibold text-red-500">{fieldErrors.password}</p>}
                </div>
              )}

              {isRegisterOtpMode && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <ShieldCheck size={14} className="text-gold-600 dark:text-gold-400" />
                    <p className="text-[11px] font-semibold">
                      Weka OTP ya tarakimu 6 tuliyotuma kwenye namba yako ya simu.
                    </p>
                  </div>
                  {renderOtpBoxes()}
                </div>
              )}

              {(isResetMode || (!isLogin && !isRegisterOtpMode)) && (
                <div className="space-y-1">
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                    <input 
                      ref={confirmPasswordInputRef}
                      type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Thibitisha Nenosiri"
                      className={`w-full pl-14 pr-14 py-3 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none transition-all text-sm text-slate-900 dark:text-white font-medium ${
                        fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/5 focus:border-gold-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold-500 transition-colors"
                      aria-label={showConfirmPassword ? 'Ficha nenosiri la uthibitisho' : 'Onyesha nenosiri la uthibitisho'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-[11px] font-semibold text-red-500">{fieldErrors.confirmPassword}</p>}
                </div>
              )}

              {isLogin && !isResetMode && !isRegisterOtpMode && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-gold-600 dark:text-gold-400 uppercase tracking-widest hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                  >
                    Kusahau Nenosiri?
                  </button>
                </div>
              )}

              {isRegisterOtpMode && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[10px] font-black text-gold-600 dark:text-gold-400 uppercase tracking-widest hover:text-gold-700 dark:hover:text-gold-300 transition-colors disabled:opacity-50"
                  >
                    Tuma OTP Tena
                  </button>
                </div>
              )}

              <button 
                type="submit" disabled={loading || isLoginOtpOverlay}
                className="w-full bg-primary-950 dark:bg-gold-500 text-white dark:text-primary-950 py-4 rounded-lg font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {loading
                  ? 'Inachakata...'
                  : isLoginOtpOverlay
                    ? 'THIBITISHA OTP KWANZA'
                    : isResetMode
                      ? 'BADILISHA NENOSIRI'
                      : isRegisterOtpMode
                        ? 'THIBITISHA OTP'
                        : isLogin
                          ? 'INGIA'
                          : 'JISAJILI'}
                {!loading && !isLoginOtpOverlay && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          <div className="mt-5 text-center space-y-3">
            {!isResetMode && (
              <button 
                onClick={() => {
                  if (isRegisterOtpMode) {
                    setIsOtpMode(false);
                    setOtpContext(null);
                    clearOtpInputs();
                    setInfoMessage('Usajili umehifadhiwa. Unaweza kuomba OTP tena kwa kubonyeza Jisajili.');
                    return;
                  }
                  setIsLogin(!isLogin);
                  setFieldErrors({});
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                onMouseDown={() => {
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-gold-600 transition-colors"
              >
                {isRegisterOtpMode
                  ? 'Rudi kwenye usajili'
                  : (isLogin ? 'Hujawahi kujiunga? Jisajili' : 'Tayari unayo akaunti? Ingia')}
              </button>
            )}
            
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={12} className="text-green-500" />
              <span className="text-[8px] font-bold uppercase tracking-widest">GC-Shield Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

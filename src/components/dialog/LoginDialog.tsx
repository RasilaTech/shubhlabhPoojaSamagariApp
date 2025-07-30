import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router"; // For navigation
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard, // For dismissing keyboard
  KeyboardAvoidingView,
  Modal, // For the dialog overlay
  Platform, // For platform-specific styles/behavior
  Pressable, // For scrollable content within panels
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "@/services/auth/authApi"; // Adjust path

import { OtpInput } from "../common/OtpInput"; // Adjust path

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const isLargeScreen = screenWidth >= 600; // sm:max-w-[750px] approx

const loginModalImage = require("../../../assets/images/loginModal.jpg"); // Adjust path and extension

const FormSchema = z.object({
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, {
      message: "Please enter a valid 10-digit mobile number",
    }),
});

// 2. OTP Schema (re-used from UserProfileForm)
const otpSchema = z.object({
  otpCode: z
    .string()
    .trim()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only digits" }),
});

type MobileFormData = z.infer<typeof FormSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

// Need a custom FormField equivalent for React Native
interface RNFormFieldProps {
  control: any; // react-hook-form control
  name: string;
  label?: string;
  children: (field: {
    onChange: (...event: any[]) => void;
    onBlur: (...event: any[]) => void;
    value: any;
    name: string;
  }) => React.ReactNode;
  errorMessage?: string; // For explicit error messages
}

const RNFormField: React.FC<RNFormFieldProps> = ({
  control,
  name,
  label,
  children,
  errorMessage,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={styles.formItem}>
          {label && <Text style={styles.formLabel}>{label}</Text>}
          {children(field)}
          {errorMessage && (
            <Text style={styles.formMessage}>{errorMessage}</Text>
          )}
        </View>
      )}
    />
  );
};

interface LoginDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isVisible,
  onClose,
}) => {
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [mobileValue, setMobileValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const form = useForm<MobileFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { mobileNumber: "" },
    mode: "onBlur",
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: "" },
    mode: "onChange",
  });

  const handleResend = async () => {
    if (showResend && resendCooldown > 0) return;
    Keyboard.dismiss();
    try {
      await requestOtp({
        phone_number: `+91${mobileValue}`,
      }).unwrap();
      setShowResend(true);
      setResendCooldown(30);
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (showResend) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setShowResend(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showResend]);

  const handleMobileSubmit = form.handleSubmit(async (data) => {
    setMobileValue(data.mobileNumber);
    Keyboard.dismiss();
    try {
      await requestOtp({
        phone_number: `+91${data.mobileNumber}`,
      }).unwrap();

      setIsOtpScreen(true);
      setShowResend(true);
      setResendCooldown(30);
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  });

  const handleOtpSubmit = otpForm.handleSubmit(async (data) => {
    Keyboard.dismiss();
    try {
      await verifyOtp({
        phone_number: `+91${mobileValue}`,
        otp_code: data.otpCode,
      }).unwrap();

      onClose();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Failed to verify OTP:", err);
      otpForm.setError("otpCode", {
        message: err?.data?.message || "Invalid OTP. Please try again.",
      });
    }
  });

  // Reset form state when modal closes
  useEffect(() => {
    if (!isVisible) {
      setIsOtpScreen(false);
      setShowResend(false);
      setMobileValue("");
      setResendCooldown(30);
      form.reset();
      otpForm.reset();
    }
  }, [isVisible]);

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <Pressable
            style={styles.dialogContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Image Panel - Only on large screens */}
            {isLargeScreen && (
              <View style={styles.imagePanel}>
                <Image
                  source={loginModalImage}
                  style={styles.loginImage}
                  alt="Login"
                />
                <Text style={styles.loginImageText}>LOGIN</Text>
              </View>
            )}

            {/* Form Panel */}
            <View style={styles.formPanel}>
              {!isOtpScreen ? (
                // Mobile Number Form
                <View style={styles.formContent}>
                  <Text style={styles.panelTitle}>Enter Mobile Number</Text>

                  <FormProvider {...form}>
                    <View style={styles.formBody}>
                      <RNFormField
                        control={form.control}
                        name="mobileNumber"
                        label="Mobile Number"
                        errorMessage={
                          form.formState.errors.mobileNumber?.message
                        }
                      >
                        {({ onChange, onBlur, value }) => (
                          <View style={styles.mobileInputGroup}>
                            <Text style={styles.mobilePrefix}>+91</Text>
                            <View style={styles.separator} />
                            <TextInput
                              style={styles.mobileInput}
                              placeholder="Enter mobile number"
                              keyboardType="phone-pad"
                              maxLength={10}
                              onBlur={onBlur}
                              onChangeText={(text) => {
                                onChange(text);
                                setMobileValue(text);
                              }}
                              value={value}
                              autoFocus={true}
                            />
                          </View>
                        )}
                      </RNFormField>
                    </View>

                    <View style={styles.formFooter}>
                      <TouchableOpacity
                        onPress={handleMobileSubmit}
                        style={[
                          styles.button,
                          isRequestingOtp && styles.disabledButton,
                        ]}
                        disabled={isRequestingOtp}
                      >
                        {isRequestingOtp ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText}>Request OTP</Text>
                        )}
                      </TouchableOpacity>

                      <Text style={styles.termsText}>
                        {"By continuing, you agree to "}
                        <Text style={styles.termsLink}>Terms of Use</Text>
                        {" and "}
                        <Text style={styles.termsLink}>Privacy Policy</Text>.
                      </Text>
                    </View>
                  </FormProvider>
                </View>
              ) : (
                // OTP Form
                <View style={styles.formContent}>
                  <Text style={styles.panelTitle}>Verify OTP</Text>

                  <View style={styles.otpMessageContainer}>
                    <Text style={styles.otpMessageText}>
                      Please enter the OTP sent to
                    </Text>
                    <View style={styles.numberChangeContainer}>
                      <Text style={styles.otpMobileNumberText}>
                        +91{mobileValue}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsOtpScreen(false)}
                        style={styles.otpChangeButton}
                      >
                        <Text style={styles.otpChangeText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <FormProvider {...otpForm}>
                    <View style={styles.otpFormBody}>
                      <RNFormField
                        control={otpForm.control}
                        name="otpCode"
                        errorMessage={otpForm.formState.errors.otpCode?.message}
                      >
                        {({ onChange, value }) => (
                          <OtpInput
                            value={value}
                            onChange={onChange}
                            maxLength={6}
                            error={otpForm.formState.errors.otpCode?.message}
                          />
                        )}
                      </RNFormField>
                    </View>

                    <View style={styles.formFooter}>
                      <TouchableOpacity
                        onPress={handleOtpSubmit}
                        style={[
                          styles.button,
                          (otpForm.watch("otpCode")?.length !== 6 ||
                            isVerifyingOtp) &&
                            styles.disabledButton,
                        ]}
                        disabled={
                          otpForm.watch("otpCode")?.length !== 6 ||
                          isVerifyingOtp
                        }
                      >
                        {isVerifyingOtp ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText}>Verify</Text>
                        )}
                      </TouchableOpacity>

                      <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                          Not received your code?{" "}
                        </Text>
                        {showResend && resendCooldown > 0 ? (
                          <Text style={styles.resendCooldownText}>
                            Resend in {resendCooldown}s
                          </Text>
                        ) : (
                          <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendLink}>Resend code</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </FormProvider>
                </View>
              )}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  dialogContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: isLargeScreen ? "row" : "column",
    width: isLargeScreen
      ? Math.min(screenWidth * 0.8, 750)
      : screenWidth * 0.92,
    maxHeight: screenHeight * 0.85,
    minHeight: isLargeScreen ? 400 : 300,
    position: "relative",
    marginHorizontal: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  imagePanel: {
    flex: isLargeScreen ? 45 : 0,
    minHeight: isLargeScreen ? 300 : 0,
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  loginImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loginImageText: {
    position: "absolute",
    top: 20,
    left: 20,
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formPanel: {
    flex: isLargeScreen ? 55 : 1,
    minHeight: isLargeScreen ? 400 : 280,
    padding: isLargeScreen ? 24 : 20,
    justifyContent: "center",
  },
  formContent: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: isLargeScreen ? 350 : 250,
  },
  panelTitle: {
    fontSize: isLargeScreen ? 22 : 20,
    fontWeight: "bold",
    marginBottom: isLargeScreen ? 24 : 16,
    textAlign: "center",
    color: "#1f2937",
  },
  formBody: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: isLargeScreen ? 20 : 22,
    marginTop: 10,
  },
  otpFormBody: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: isLargeScreen ? 20 : 1,
    marginTop: 10,
  },
  formFooter: {
    paddingTop: isLargeScreen ? 30 : 40,
  },
  formItem: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  formMessage: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 6,
  },
  mobileInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "#e5e7eb",
    paddingBottom: 8,
  },
  mobilePrefix: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
    marginRight: 12,
  },
  separator: {
    height: 24,
    width: 1,
    backgroundColor: "#d1d5db",
    marginRight: 12,
  },
  mobileInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 0,
  },
  button: {
    backgroundColor: "#fb641b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  disabledButton: {
    opacity: 0.6,
  },
  termsText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#fb641b",
    textDecorationLine: "underline",
  },
  otpMessageContainer: {
    alignItems: "center",
    marginBottom: isLargeScreen ? 32 : 20,
    paddingHorizontal: 8,
  },
  otpMessageText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  numberChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  otpMobileNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 2,
  },
  otpChangeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  otpChangeText: {
    fontSize: 14,
    color: "#fb641b",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  resendText: {
    fontSize: 14,
    color: "#6b7280",
  },
  resendCooldownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fb641b",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fb641b",
    textDecorationLine: "underline",
  },
});

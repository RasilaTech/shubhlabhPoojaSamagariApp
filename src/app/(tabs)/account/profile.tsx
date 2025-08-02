import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";
import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import {
  useGetUserDetailsQuery,
  useUpdateUserDetailsMutation,
  useUpdateUserEmailMutation,
  useVerifyEmailMutation,
} from "@/services/user/userApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

// --- FIX: Add missing schemas here ---
const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"], {
    message: "Gender is required",
  }),
});
type UserFormData = z.infer<typeof userSchema>;

const otpSchema = z.object({
  otpCode: z
    .string()
    .trim()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only digits" }),
});
type OtpFormData = z.infer<typeof otpSchema>;

// --- Custom OTP Input Component ---
interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  maxLength,
  error,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleTextChange = (text: string, index: number) => {
    const newOtp = value.split("");
    newOtp[index] = text;
    const updatedValue = newOtp.join("");
    onChange(updatedValue);

    if (text && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpInputGroup}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => {
            inputRefs.current[i] = ref;
          }}
          style={[
            styles.otpInputSlot,
            error && styles.otpInputSlotError,
            { borderColor: value[i] ? "#ff5200" : "#ccc" },
            { color: colors.text },
          ]}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleTextChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          value={value[i] || ""}
          caretHidden={false}
          returnKeyType={i === maxLength - 1 ? "done" : "next"}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (i < maxLength - 1) {
              inputRefs.current[i + 1]?.focus();
            }
          }}
        />
      ))}
    </View>
  );
};

export default function UserProfileForm() {
  const { data: userData, isLoading: userLoading } = useGetUserDetailsQuery();
  const [updateUserDetails] = useUpdateUserDetailsMutation();
  const [emailError, setEmailError] = useState("");

  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otpCode: "",
    },
    mode: "onChange",
  });

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "male",
    },
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = userForm;

  useEffect(() => {
    if (userData?.data) {
      const { first_name, last_name, gender, email: userEmail } = userData.data;
      setValue("first_name", first_name);
      setValue("last_name", last_name);
      setValue("gender", gender || "male");

      if (userEmail) {
        setEmail(userEmail);
        setIsEmailEditable(false);
      } else {
        setEmail("");
        setIsEmailEditable(true);
      }
    }
  }, [userData, setValue]);

  const [requestOtp] = useVerifyEmailMutation();
  const [updateEmail] = useUpdateUserEmailMutation();

  const sendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");

    setIsVerifyingEmail(true);

    try {
      await requestOtp({ email }).unwrap();
      setIsOtpVisible(true);
      Alert.alert(
        "OTP Sent",
        "A 6-digit OTP has been sent to your email address."
      );
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      setEmailError(
        err?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const verifyEmailOTP = async () => {
    const otpValue = otpForm.getValues("otpCode");

    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      otpForm.setError("otpCode", { message: "OTP must be 6 digits" });
      return;
    }
    otpForm.clearErrors("otpCode");

    setIsVerifyingOtp(true);

    try {
      await updateEmail({ email, otp_code: otpValue }).unwrap();
      setIsOtpVisible(false);
      setIsEmailEditable(false);
      Alert.alert(
        "Email Verified",
        "Your email has been successfully verified!"
      );
    } catch (err: any) {
      console.error("Failed to verify OTP/update email:", err);
      otpForm.setError("otpCode", {
        message: err?.data?.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const onSubmit = async (formData: z.infer<typeof userSchema>) => {
    if (!userData?.data?.id) {
      Alert.alert("Error", "User data not loaded. Cannot save.");
      return;
    }

    try {
      await updateUserDetails({
        id: userData.data.id,
        ...formData,
        phone_number: userData.data.phone_number,
        email,
      }).unwrap();
      Alert.alert("Success", "User details updated successfully!");
    } catch (err: any) {
      console.error("Failed to update user details:", err);
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to update details. Please try again."
      );
    }
  };

  if (userLoading) {
    return <OrderDetailSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardAvoidingView,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[
            styles.sectionContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            Email address
          </Text>
          <View style={styles.emailInputWrapper}>
            <TextInput
              style={[
                styles.textInput,
                styles.emailTextInput,
                !isEmailEditable && styles.disabledInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={email}
              editable={isEmailEditable}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!userData?.data?.email || isEmailEditable ? (
              <TouchableOpacity
                onPress={sendOTP}
                style={[
                  styles.emailActionButton,
                  isVerifyingEmail && styles.disabledButton,
                ]}
                disabled={isVerifyingEmail}
              >
                {isVerifyingEmail ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.emailActionButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEmailEditable(true)}
                style={styles.emailActionButton}
              >
                <Text style={styles.emailActionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {emailError && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {emailError}
            </Text>
          )}
          {isOtpVisible && (
            <View style={styles.otpFormContainer}>
              <FormProvider {...otpForm}>
                <Controller
                  control={otpForm.control}
                  name="otpCode"
                  render={({ field: { onChange, value } }) => (
                    <OtpInput
                      value={value}
                      onChange={onChange}
                      maxLength={6}
                      error={otpForm.formState.errors.otpCode?.message}
                    />
                  )}
                />
                {otpForm.formState.errors.otpCode && (
                  <Text
                    style={[styles.errorText, { color: colors.destructive }]}
                  >
                    {otpForm.formState.errors.otpCode.message}
                  </Text>
                )}
              </FormProvider>
              <TouchableOpacity
                onPress={verifyEmailOTP}
                style={[
                  styles.button,
                  styles.verifyButton,
                  (otpForm.watch("otpCode")?.length !== 6 || isVerifyingOtp) &&
                    styles.disabledButton,
                ]}
                disabled={
                  otpForm.watch("otpCode")?.length !== 6 || isVerifyingOtp
                }
              >
                {isVerifyingOtp ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                      Verifying...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View
          style={[
            styles.sectionContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View>
            <Text style={[styles.label, { color: colors.text }]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.disabledInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={`+91 ${userData?.data?.phone_number || ""}`}
              editable={false}
            />
          </View>

          <View style={styles.nameInputsContainer}>
            <View style={styles.nameInputWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>
                First Name
              </Text>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.first_name && styles.errorInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCorrect={false}
                  />
                )}
              />
              {errors.first_name && (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {errors.first_name.message}
                </Text>
              )}
            </View>
            <View style={styles.nameInputWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>
                Last Name
              </Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.last_name && styles.errorInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCorrect={false}
                  />
                )}
              />
              {errors.last_name && (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {errors.last_name.message}
                </Text>
              )}
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
            <View style={styles.genderOptionsContainer}>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => onChange("male")}
                    >
                      <View
                        style={[
                          styles.radioButton,
                          {
                            borderColor: colors.accent,
                            backgroundColor: colors.cardBackground,
                          },
                        ]}
                      >
                        {value === "male" && (
                          <View
                            style={[
                              styles.radioButtonInner,
                              { backgroundColor: colors.accent },
                            ]}
                          />
                        )}
                      </View>
                      <Text style={[styles.radioText, { color: colors.text }]}>
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => onChange("female")}
                    >
                      <View
                        style={[
                          styles.radioButton,
                          {
                            borderColor: colors.accent,
                            backgroundColor: colors.cardBackground,
                          },
                        ]}
                      >
                        {value === "female" && (
                          <View
                            style={[
                              styles.radioButtonInner,
                              { backgroundColor: colors.accent },
                            ]}
                          />
                        )}
                      </View>
                      <Text style={[styles.radioText, { color: colors.text }]}>
                        Female
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              />
            </View>
            {errors.gender && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {errors.gender.message}
              </Text>
            )}
          </View>

          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={[styles.button, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionContainer: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
  },
  textInput: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  disabledInput: {
    // This color will be overridden by theme-aware styles
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
  },
  emailInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  emailTextInput: {
    flex: 1,
    paddingRight: 100,
  },
  emailActionButton: {
    position: "absolute",
    right: 5,
    backgroundColor: "#ff5200",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  emailActionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  otpFormContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  otpInputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    maxWidth: 300,
    alignSelf: "center",
  },
  otpInputSlot: {
    width: 40,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "transparent",
  },
  otpInputSlotError: {
    borderColor: "red",
  },
  button: {
    marginTop: 20,
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButton: {
    marginTop: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  nameInputsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  nameInputWrapper: {
    flex: 1,
  },
  genderOptionsContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 16,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 16,
  },
  saveButtonContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingTop: 8,
    width: "100%",
  },
});

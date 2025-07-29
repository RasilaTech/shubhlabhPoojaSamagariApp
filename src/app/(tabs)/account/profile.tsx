import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form"; // Import Controller
import {
  ActivityIndicator, // Add ActivityIndicator import
  Alert,
  KeyboardAvoidingView, // For keyboard management
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

// Adjust paths for your RTK Query hooks and types
import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";
import {
  useGetUserDetailsQuery,
  useUpdateUserDetailsMutation,
  useUpdateUserEmailMutation,
  useVerifyEmailMutation,
} from "@/services/user/userApi"; // Adjust path as needed
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Assuming a generic skeleton or activity indicator

// --- Zod Schemas ---
const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"], {
    message: "Gender is required", // <--- CORRECTED LINE
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
            // Use a block to ensure implicit return is void
            inputRefs.current[i] = ref;
          }}
          style={[
            styles.otpInputSlot,
            error && styles.otpInputSlotError,
            { borderColor: value[i] ? "#ff5200" : "#ccc" }, // Highlight if slot has value
          ]}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleTextChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          value={value[i] || ""}
          caretHidden={false} // Show cursor
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

// --- Main User Profile Form Component ---
export default function UserProfileForm() {
  const { data: userData, isLoading: userLoading } = useGetUserDetailsQuery();
  const [updateUserDetails] = useUpdateUserDetailsMutation();
  const [emailError, setEmailError] = useState("");

  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  
  // Add loading states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  const insets = useSafeAreaInsets();

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otpCode: "",
    },
    mode: "onChange", // Validate on change for OTP input
  });

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "male", // Default
    },
    mode: "onBlur", // Validate on blur for user fields
  });

  // Destructure userForm methods for easier access
  const {
    control, // Use control for Controller
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = userForm;

  // Effect to populate form when user data loads
  useEffect(() => {
    if (userData?.data) {
      const { first_name, last_name, gender, email: userEmail } = userData.data;
      setValue("first_name", first_name);
      setValue("last_name", last_name);
      setValue("gender", gender || "male"); // Ensure default if null/undefined

      // Initialize email state
      if (userEmail) {
        setEmail(userEmail);
        setIsEmailEditable(false); // Default: not editable if email exists
      } else {
        setEmail(""); // Clear if no email from backend
        setIsEmailEditable(true); // Editable if no email
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
    setEmailError(""); // Clear previous errors

    setIsVerifyingEmail(true); // Start loading

    try {
      // Assuming requestOtp returns a promise you can await
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
      setIsVerifyingEmail(false); // Stop loading
    }
  };

  const verifyEmailOTP = async () => {
    const otpValue = otpForm.getValues("otpCode");

    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      otpForm.setError("otpCode", { message: "OTP must be 6 digits" });
      return;
    }
    otpForm.clearErrors("otpCode"); // Clear any previous OTP errors

    setIsVerifyingOtp(true); // Start loading

    try {
      await updateEmail({ email, otp_code: otpValue }).unwrap();
      setIsOtpVisible(false); // Hide OTP form
      setIsEmailEditable(false); // Lock email after verification
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
      setIsVerifyingOtp(false); // Stop loading
    }
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  const onSubmit = async (formData: UserFormData) => {
    if (!userData?.data?.id) {
      Alert.alert("Error", "User data not loaded. Cannot save.");
      return;
    }

    try {
      await updateUserDetails({
        id: userData.data.id,
        ...formData,
        phone_number: userData.data.phone_number, // Ensure phone_number is passed if needed by API
        email, // Ensure email is passed
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
    return <OrderDetailSkeleton />; // Using ProductDetailsSkeleton as a generic loader
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Profile
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Email Input Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.emailInputWrapper}>
            <TextInput
              style={[
                styles.textInput,
                styles.emailTextInput,
                !isEmailEditable && styles.disabledInput,
              ]}
              value={email}
              editable={isEmailEditable} // Use editable for RN TextInput
              onChangeText={setEmail} // Use onChangeText for RN TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!userData?.data?.email || isEmailEditable ? ( // No user email OR email is editable
              <TouchableOpacity
                onPress={sendOTP}
                style={[
                  styles.emailActionButton,
                  isVerifyingEmail && styles.disabledButton
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
              // User has email and it's not editable
              <TouchableOpacity
                onPress={() => setIsEmailEditable(true)}
                style={styles.emailActionButton}
              >
                <Text style={styles.emailActionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}
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
                  <Text style={styles.errorText}>
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
                disabled={otpForm.watch("otpCode")?.length !== 6 || isVerifyingOtp}
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

        {/* Main User Details Form */}
        <View style={styles.sectionContainer}>
          {/* Phone Number (non-editable) */}
          <View>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={`+91 ${userData?.data?.phone_number || ""}`}
              editable={false}
            />
          </View>

          {/* Name Inputs */}
          <View style={styles.nameInputsContainer}>
            <View style={styles.nameInputWrapper}>
              <Text style={styles.label}>First Name</Text>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCorrect={false}
                  />
                )}
              />
              {errors.first_name && (
                <Text style={styles.errorText}>
                  {errors.first_name.message}
                </Text>
              )}
            </View>
            <View style={styles.nameInputWrapper}>
              <Text style={styles.label}>Last Name</Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCorrect={false}
                  />
                )}
              />
              {errors.last_name && (
                <Text style={styles.errorText}>{errors.last_name.message}</Text>
              )}
            </View>
          </View>

          {/* Gender Selection */}
          <View>
            <Text style={styles.label}>Gender</Text>
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
                      <View style={styles.radioButton}>
                        {value === "male" && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => onChange("female")}
                    >
                      <View style={styles.radioButton}>
                        {value === "female" && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Female</Text>
                    </TouchableOpacity>
                  </>
                )}
              />
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender.message}</Text>
            )}
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)} // Use handleSubmit for form submission
              style={styles.button}
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
    backgroundColor: "#f0f0f5", // Light gray background
  },
  sectionContainer: {
    backgroundColor: "white",
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
    backgroundColor: "#fff",
    shadowColor: "#000", // shadow-cart-card (approx)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4, // Android shadow
  },
  backButton: {
    paddingRight: 10, // gap-2 from original
  },
  headerTitle: {
    flex: 1, // Allow title to take remaining space
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#02060cbf",
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  textInput: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: "red",
  },

  // Email specific styles
  emailInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  emailTextInput: {
    flex: 1,
    paddingRight: 100, // Make space for the button
  },
  emailActionButton: {
    position: "absolute",
    right: 5,
    backgroundColor: "#ff5200", // Adjusted orange
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70, // Add minimum width to prevent button size changes
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

  // OTP Input styles
  otpInputGroup: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribute slots evenly
    gap: 8, // space-x-1 or gap-1
    width: "100%",
    maxWidth: 300, // Limit width of OTP group
    alignSelf: "center", // Center the OTP group
  },
  otpInputSlot: {
    width: 40, // w-10 (approx)
    height: 45, // h-12 (approx)
    borderRadius: 8, // rounded
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 20, // text-xl
    color: "#333",
    backgroundColor: "#fff",
  },
  otpInputSlotError: {
    borderColor: "red",
  },

  // Common Button styles
  button: {
    marginTop: 20,
    width: "100%",
    borderRadius: 8, // rounded-md
    backgroundColor: "#ff5200", // bg-[#fb641b] or bg-[#ff5200]
    paddingVertical: 12, // py-2
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Add minimum height to prevent button size changes
  },
  buttonText: {
    color: "white",
    fontSize: 16, // text-sm (adjusted for better mobile readability)
    fontWeight: "600", // font-semibold
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButton: {
    marginTop: 15, // mt-5 (approx)
  },
  disabledButton: {
    backgroundColor: "#ff520099", // A lighter shade of orange for disabled
  },

  // Name Inputs styles
  nameInputsContainer: {
    flexDirection: "row",
    gap: 16, // gap-4
    marginBottom: 16,
  },
  nameInputWrapper: {
    flex: 1, // flex-1
  },

  // Gender Radio Button styles
  genderOptionsContainer: {
    flexDirection: "row",
    gap: 16, // gap-4
    marginTop: 5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
    fontSize: 16, // text-sm
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ff5200", // accent-pink-600 (use a consistent accent color)
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#ff5200", // Inner circle color
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },

  // Save Button Container
  saveButtonContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end", // Aligns the button to the right
    paddingTop: 8, // pt-2
    width: "100%",
  },
  // The button style itself is reused from `button`
});
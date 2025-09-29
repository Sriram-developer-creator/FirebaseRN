import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import functions from "@react-native-firebase/functions";
import auth from "@react-native-firebase/auth";
import Signout from "./SignOut";

export default function LoginScreen({onClickOnSignout}: any) {
  const [iqama, setIqama] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp" | "done">("credentials");
  const [sessionId, setSessionId] = useState<string | null>(null);

  async function callLogin(payload: any) {
    return functions().httpsCallable("loginUser")(payload);
  }

  // Step 1: Validate creds & request OTP
  async function handleSendOtp() {
    if (!iqama || !password) {
      Alert.alert("Error", "Enter Iqama number and password");
      return;
    }

    try {
      const res = await callLogin({ iqama, password });
      if (res.data.status === "OTP_SENT") {
        setSessionId(res.data.sessionId);
        setStep("otp");
        Alert.alert("OTP Sent", "Check your registered mobile");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP");
    }
  }

  // Step 2: Verify OTP with sessionId
  async function handleVerifyOtp() {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    if (!sessionId) {
      Alert.alert("Error", "Missing session. Please login again.");
      return;
    }

    try {
      const res = await callLogin({ iqama, otp, sessionId }); // ✅ send sessionId
      if (res.data.status === "USER_LOGGED_IN") {
        const finalToken = res.data.token;
        await auth().signInWithCustomToken(finalToken);
        setStep("done");
        Alert.alert("Success", "You are logged in");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "OTP verification failed");
    }
  }

  return (
    <View style={{ padding: 20 }}>
      {step === "credentials" && (
        <>
          <Text>Iqama Number</Text>
          <TextInput value={iqama} onChangeText={setIqama} />
          <Text>Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Send OTP" onPress={handleSendOtp} />
        </>
      )}

      {step === "otp" && (
        <>
          <Text>Enter OTP</Text>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </>
      )}

      {step === "done" && (
        <>
          <Text style={{ fontSize: 18, color: "green" }}>✅ Login Complete</Text>
          <Signout onClickOnSignout={onClickOnSignout} />
        </>
      )}
    </View>
  );
}

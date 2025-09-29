import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import functions from "@react-native-firebase/functions";

export default function SignupScreen() {
  const [mobile, setMobile] = useState("");
  const [iqama, setIqama] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("MOBILE");

  async function callSignup(payload) {
    if (__DEV__) {
      functions().useFunctionsEmulator("http://10.0.2.2:5001"); // Android emulator
    }
    return await functions().httpsCallable("signupUser")(payload);
  }

  function isValidPhone(mobile) {
    const digits = mobile.replace(/\D/g, "");
    return digits.length === 9; 
  }

  async function handleSendOtp() {
    if (!mobile || !iqama) {
      Alert.alert("Error", "Enter Mobile and Iqama");
      return;
    }

     if (!isValidPhone(mobile)) {
        Alert.alert("Error", "Invalid phone number");
        return;
      } 

    try {
      const res = await callSignup({ mobile, iqama });
      console.log('res', res)
      if (res.data.status === "OTP_SENT") {
        setStep("OTP");
        Alert.alert("OTP Sent", "Check your phone");
      }
    } catch (err) {
      handleError(err);
    }
  }

  async function handleVerifyOtp() {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    try {
      const res = await callSignup({ mobile, iqama, otp });
      console.log('res 2', res)

      if (res.data.status === "OTP_VERIFIED") {
        setStep("PASSWORD");
        Alert.alert("OTP Verified", "Now set your password");
      }
    } catch (err) {
      handleError(err);
    }
  }

  async function handleCreateUser() {
    if (!password) {
      Alert.alert("Error", "Enter Password");
      return;
    }

    try {
      const res = await callSignup({ mobile, iqama, otp, password });
      console.log('res 3', res)
      if (res.data.status === "USER_CREATED") {
        Alert.alert("Success", "User created successfully");
        setStep("DONE");
      }
    } catch (err) {
      console.log('err', err)
      handleError(err);
    }
  }

  function handleError(err) {
    const msg = err.message || "";
    if (msg.includes("already registered")) {
      Alert.alert("Signup Error", msg);
    } else if (msg.includes("OTP Invalid")) {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } else if (msg.includes("Too many attempts")) {
      Alert.alert("Error", "Too many attempts. Try again later.");
    } else {
      Alert.alert("Error", msg);
    }
  }

  function onPressOnBack(){

  }

  return (
    <View style={{ padding: 20 }}>
      {step === "MOBILE" && (
        <>
          <Text>Mobile</Text>
          <TextInput value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <Text>Iqama Number</Text>
          <TextInput value={iqama} onChangeText={setIqama} />
          <Button title="Send OTP" onPress={handleSendOtp} />
        </>
      )}

      {step === "OTP" && (
        <>
          <Text>Enter OTP</Text>
          <TextInput value={otp} onChangeText={setOtp} keyboardType="numeric" />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </>
      )}

      {step === "PASSWORD" && (
        <>
          <Text>Set Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Create Account" onPress={handleCreateUser} />
        </>
      )}

      {step === "DONE" && (
        <>
          <Text style={{ fontSize: 18, color: "green" }}>✅ Signup Complete</Text>
          <Button title="Back" onPress={()=>setStep('MOBILE')} />
        </>
      )}
    </View>
  );
}

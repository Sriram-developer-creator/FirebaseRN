import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import functions from "@react-native-firebase/functions";
import auth from "@react-native-firebase/auth";

export default function LoginScreen() {
  const [iqama, setIqama] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [step, setStep] = useState<
    "credentials" | "otp" | "done" | "step1" | "step2" | "step3"
  >("credentials");

  // 🔹 Cloud function helper
  async function callCF(name: string, payload: any) {
    if (__DEV__) {
      functions().useFunctionsEmulator("http://10.0.2.2:5001");
    }
    return functions().httpsCallable(name)(payload);
  }

  // 🔹 Save progress
  async function saveProgress(step: string) {
    const user = auth().currentUser;
    if (!user) return;
    try {
      await callCF("saveUserProgress", { uid: user.uid, step });
      console.log("Progress saved:", step);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }

  // 🔹 Get progress
  async function getProgress(uid: string) {
    try {
      const res = await callCF("getUserProgress", { uid });
      return res.data.step || "step1";
    } catch (err) {
      console.error("Error fetching progress:", err);
      return "step1";
    }
  }

  // Step 1: Send OTP
  async function handleSendOtp() {
    if (!iqama || !password) {
      Alert.alert("Error", "Enter Iqama number and password");
      return;
    }

    try {
      const res = await callCF("loginUser", { iqama, password });
      if (res.data.status === "OTP_SENT") {
        setSessionId(res.data.sessionId);
        setStep("otp");
        Alert.alert("OTP Sent", "Check your registered mobile for the code");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP");
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp() {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    try {
      const res = await callCF("loginUser", { iqama, otp, sessionId });

      if (res.data.status === "USER_LOGGED_IN") {
        const finalToken = res.data.token;
        await auth().signInWithCustomToken(finalToken);

        const uid = auth().currentUser?.uid;
        let userStep = "step1";

        if (uid) {
          userStep = await getProgress(uid);
        }

        setStep(userStep);
        if(userStep != "step1"){
          Alert.alert("Welcome back!", `Continuing from ${userStep.toUpperCase()}`);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "OTP verification failed");
    }
  }

  // 🔹 Sign out
  async function handleSignOut() {
    await auth().signOut();
    setIqama("");
    setPassword("");
    setOtp("");
    setStep("credentials");
    Alert.alert("Signed Out", "You have been signed out successfully.");
  }

  // 🔹 Move to next step & save progress
  function goToStep(nextStep: "step1" | "step2" | "step3") {
    setStep(nextStep);
    saveProgress(nextStep);
  }

  // ---- UI ----
  return (
    <View style={styles.container}>
      {/* Step: Credentials */}
      {step === "credentials" && (
        <>
          <Text style={styles.label}>Iqama Number</Text>
          <TextInput
            style={styles.input}
            value={iqama}
            onChangeText={setIqama}
            placeholder="Enter Iqama Number"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password"
            secureTextEntry
          />

          <Button title="Send OTP" onPress={handleSendOtp} />
        </>
      )}

      {/* Step: OTP */}
      {step === "otp" && (
        <>
          <Text style={styles.label}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="6-digit OTP"
            keyboardType="numeric"
            maxLength={6}
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </>
      )}

      {/* Step 1 */}
      {step === "step1" && (
        <View style={styles.center}>
          <Text style={styles.stepText}>🟦 Step 1</Text>
          <Button title="Move to Step 2" onPress={() => goToStep("step2")} />
          <View style={styles.signOutBtn}>
            <Button title="Sign Out" color="red" onPress={handleSignOut} />
          </View>
        </View>
      )}

      {/* Step 2 */}
      {step === "step2" && (
        <View style={styles.center}>
          <Text style={styles.stepText}>🟨 Step 2</Text>
          <Button title="Move to Step 3" onPress={() => goToStep("step3")} />
          <View style={styles.signOutBtn}>
            <Button title="Sign Out" color="red" onPress={handleSignOut} />
          </View>
        </View>
      )}

      {/* Step 3 */}
      {step === "step3" && (
        <View style={styles.center}>
          <Text style={styles.stepText}>🟩 Step 3</Text>
          <Button
            title="Done"
            onPress={() => {
              Alert.alert("Purchase Complete", "Start a new purchase?", [
                {
                  text: "OK",
                  onPress: () => {
                    goToStep("step1");
                  },
                },
              ]);
            }}
          />
          <View style={styles.signOutBtn}>
            <Button title="Sign Out" color="red" onPress={handleSignOut} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
  },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  center: { justifyContent: "center", alignItems: "center" },
  stepText: { fontSize: 24, marginBottom: 20 },
  signOutBtn: { marginTop: 20 },
});

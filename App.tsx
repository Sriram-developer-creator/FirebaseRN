import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import LoginScreen from "./Login";
import SignupScreen from "./SignUp";

export default function App() {
  const [step, setStep] = useState(1)
  
  const onClickOnSignout = () =>{
    setStep(1)
  }

  const onClickOnGoToLogin = () => {
    setStep(2)
  }

  return (
    <View style={{ padding: 20 }}>
      <Button onPress={()=>setStep(1)} title="SignUp" />
      <Button onPress={()=>setStep(2)} title="Login" />
      {step === 2 ? <LoginScreen  onClickOnSignout={onClickOnSignout}/> : <SignupScreen onClickOnGoToLogin={onClickOnGoToLogin} /> }
    </View>
  );
}

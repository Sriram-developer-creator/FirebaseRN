import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import auth from "@react-native-firebase/auth";

export default function Signout({onClickOnSignout}: any) {
  const [user, setUser] = useState<any>(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  async function handleSignOut() {
    try {
      await auth().signOut();
      console.log("✅ Signed out");
      onClickOnSignout()
    } catch (err) {
      console.error("❌ Signout failed", err);
    }
  }

  if (!user) {
    return (
      <View style={{ padding: 20 }}>
        <Text>🔒 Not signed in</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome, {user.email || user.uid}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

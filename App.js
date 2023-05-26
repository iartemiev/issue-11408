import { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { onCreateTodo } from "./src/graphql/subscriptions";
import { createTodo } from "./src/graphql/mutations";
import awsconfig from "./src/aws-exports";

Amplify.configure(awsconfig);

function LastEvent() {
  const [lastEvent, setLastEvent] = useState({});

  useFocusEffect(
    useCallback(() => {
      const subscription = API.graphql(
        graphqlOperation(onCreateTodo)
      ).subscribe({
        next: async (event) => {
          console.log("event received", event);
          setLastEvent(event.value);
        },
        error: (error) => {
          console.log("error in chats subscription useChatRoomUsers", {
            error,
          });
        },
      });

      return () => subscription.unsubscribe();
    }, [])
  );

  return (
    <>
      <Text>Last Received Event:</Text>
      <Text>{JSON.stringify(lastEvent, null, 2)}</Text>
    </>
  );
}

async function newTodo() {
  const newTodoInput = { input: { name: "Todo " + Date.now() } };
  await API.graphql(graphqlOperation(createTodo, newTodoInput));
}

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Button onPress={newTodo} title="New Todo"></Button>
        <LastEvent />
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

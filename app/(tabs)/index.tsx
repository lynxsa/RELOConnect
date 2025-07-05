import React from 'react';
import RN from 'react-native';

const { View, Text } = RN;

export default function AppIndex() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0057FF' }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        RELOConnect
      </Text>
      <Text style={{ color: 'white', fontSize: 16, marginTop: 10 }}>
        Mobile App Loading...
      </Text>
    </View>
  );
}

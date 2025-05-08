import React from 'react';
import { Text } from 'react-native';

export default function Greeting({ name }: { name: string }) {
  return (
    <Text style={{ fontSize: 20, color: 'blue' }}>
      Hello {name}, Welcome
    </Text>
  );
}
import React from 'react';
import { render } from '@testing-library/react-native';
import Greeting from '../src/components/Greeting';

test('displays greeting with name', () =>{
    const { getByText } = render(<Greeting name="John" />);
    expect(getByText('Hello John, Welcome')).toBeTruthy();
})
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react'
import { expect, test } from 'vitest'
import { useCounter } from './count.hook';

test('Sample test of Valtio', async () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.currentCount).toBe(0);

    act(() => {
        result.current.increment();
    });

    await waitFor(() => {
        expect(result.current.currentCount).toBe(1);
    })
});

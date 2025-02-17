import { proxy, useSnapshot } from 'valtio'

type TestState = {
    count: number
}

const testState = proxy<TestState>({
    count: 0,
})

const setCount = (n: number) => {
    testState.count = n
}

export const useTestState = () => ({
    setCount,
    testSnapshot: useSnapshot(testState)
})

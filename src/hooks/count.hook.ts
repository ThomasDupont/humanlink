import { useTestState } from "@/state/test.state"

export const useCounter = () => {
    const { setCount, testSnapshot } = useTestState()

    const increment = () => {
        setCount(testSnapshot.count + 1)
    }

    return {
        currentCount: testSnapshot.count,
        increment
    }
}

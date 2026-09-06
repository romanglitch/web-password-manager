import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("обратный отсчёт уменьшается каждую секунду", () => {
	const expiresAt = Date.now() + 5000;
	const { result } = renderHook(() => useCountdown(expiresAt));

	expect(result.current).toBe(5);

	act(() => { jest.advanceTimersByTime(1000); });
	expect(result.current).toBe(4);

	act(() => { jest.advanceTimersByTime(3000); });
	expect(result.current).toBe(1);
});

test("возвращает 0 когда таймер истёк", () => {
	const expiresAt = Date.now() + 1000;
	const { result } = renderHook(() => useCountdown(expiresAt));

	act(() => { jest.advanceTimersByTime(2000); });
	expect(result.current).toBe(0);
});

test("возвращает 0 для null", () => {
	const { result } = renderHook(() => useCountdown(null));
	expect(result.current).toBe(0);
});
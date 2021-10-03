import { renderHook } from '@testing-library/react-hooks'
import useTemplate from '.'

describe('npm-package-template ', () => {
	it('should return starter text', () => {
		const { result } = renderHook(() => useTemplate())
		expect(result.current).toBe('You are using the default template.')
	})
})

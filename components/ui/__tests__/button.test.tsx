import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button, buttonVariants } from '../button'
import { cn } from '@/lib/utils'

describe('Button 컴포넌트', () => {
  // 기본 렌더링 테스트
  it('기본 버튼이 정상적으로 렌더링되어야 합니다', () => {
    render(<Button>테스트 버튼</Button>)
    const button = screen.getByRole('button', { name: '테스트 버튼' })
    expect(button).toBeInTheDocument()
  })

  // variant 옵션 테스트
  it.each([
    'default',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'link'
  ] as const)('%s variant가 적용된 버튼이 렌더링되어야 합니다', (variant) => {
    render(<Button variant={variant}>테스트 버튼</Button>)
    const button = screen.getByRole('button')

    // variant에 따른 특정 클래스 확인
    switch (variant) {
      case 'default':
        expect(button.className).toContain('bg-primary')
        break
      case 'destructive':
        expect(button.className).toContain('bg-destructive')
        break
      case 'outline':
        expect(button.className).toContain('border-input')
        break
      case 'secondary':
        expect(button.className).toContain('bg-secondary')
        break
      case 'ghost':
        expect(button.className).toContain('hover:bg-accent')
        break
      case 'link':
        expect(button.className).toContain('underline-offset-4')
        break
    }
  })

  // size 옵션 테스트
  it.each([
    ['default', 'h-9'],
    ['sm', 'h-8'],
    ['lg', 'h-10'],
    ['icon', 'size-9']
  ] as const)('%s size가 적용된 버튼이 렌더링되어야 합니다', (size, expectedClass) => {
    render(<Button size={size}>테스트 버튼</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain(expectedClass)
  })

  // asChild prop 테스트
  it('asChild prop이 true일 때 링크로 렌더링되어야 합니다', () => {
    render(
      <Button asChild>
        <a href="#">링크 버튼</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#')
    expect(link).toHaveAttribute('data-slot', 'button')
  })

  // 클릭 이벤트 테스트
  it('클릭 이벤트가 정상적으로 동작해야 합니다', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>클릭 테스트</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // disabled 상태 테스트
  it('disabled 상태일 때 클릭이 불가능해야 합니다', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>비활성화 버튼</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  // className prop 테스트
  it('추가 className이 적용되어야 합니다', () => {
    const customClass = 'custom-class'
    render(<Button className={customClass}>커스텀 클래스 버튼</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain(customClass)
  })
}) 
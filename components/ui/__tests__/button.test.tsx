import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'
import { Slot } from '@radix-ui/react-slot'

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
  ])('%s variant가 적용된 버튼이 렌더링되어야 합니다', (variant) => {
    render(<Button variant={variant as any}>테스트 버튼</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass(`bg-${variant === 'default' ? 'primary' : variant}`)
  })

  // size 옵션 테스트
  it.each([
    'default',
    'sm',
    'lg',
    'icon'
  ])('%s size가 적용된 버튼이 렌더링되어야 합니다', (size) => {
    render(<Button size={size as any}>테스트 버튼</Button>)
    const button = screen.getByRole('button')
    const expectedClass = size === 'default' ? 'h-9' : size === 'sm' ? 'h-8' : size === 'lg' ? 'h-10' : 'size-9'
    expect(button).toHaveClass(expectedClass)
  })

  // asChild prop 테스트
  it('asChild prop이 true일 때 Slot 컴포넌트를 사용해야 합니다', () => {
    const { container } = render(
      <Button asChild>
        <a href="#">링크 버튼</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#')
  })

  // 클릭 이벤트 테스트
  it('클릭 이벤트가 정상적으로 동작해야 합니다', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>클릭 테스트</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // disabled 상태 테스트
  it('disabled 상태일 때 클릭이 불가능해야 합니다', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>비활성화 버튼</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
}) 
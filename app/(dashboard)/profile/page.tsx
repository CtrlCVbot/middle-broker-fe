import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">홈</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>프로필</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-4 pt-0">
        <div className="flex flex-col items-center gap-6 py-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/avatars/shadcn.jpg" alt="사용자 프로필" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold">홍길동</h1>
            <p className="text-muted-foreground">user@example.com</p>
          </div>
          <div className="w-full max-w-md rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">프로필 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">이름</div>
                <div>홍길동</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">이메일</div>
                <div>user@example.com</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">전화번호</div>
                <div>010-1234-5678</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">직책</div>
                <div>시니어 개발자</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">부서</div>
                <div>개발팀</div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
              프로필 수정
            </button>
            <button className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 
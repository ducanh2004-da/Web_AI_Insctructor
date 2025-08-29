import { lazy } from 'react'
import { createBrowserRouter, redirect } from 'react-router-dom'

import { AuthLayout, MainLayout, ClassRoomLayout, DashboardLayout } from '@/layouts'
import { ErrorBoundary } from '@/components'
import { getCookie, isTokenValid, deleteCookie } from '@/stores'

const Pages = {
  Main: {
    Home: lazy(() => import('@/pages/public/Home')),
    About: lazy(() => import('@/pages/public/About')),
    Courses: lazy(() => import('@/pages/public/Courses')),
    CourseDetails: lazy(() => import('@/pages/public/CourseDetails')),
    Contact: lazy(() => import('@/pages/public/Contact'))
  },
  Auth: {
    Login: lazy(() => import('@/pages/public/auth/Login')),
    Register: lazy(() => import('@/pages/public/auth/Register'))
  },
  Dashboard: {
    ClassRoom: lazy(() => import('@/pages/dashboard/ClassRoom'))
  }
} 

const authGuard = () => {
  const token = getCookie('token')
  
  if (!token || !isTokenValid(token)) {
    if (token) {
      deleteCookie('token')
    }
    return redirect('/auth/login')
  }
  return null
}

const redirectIfAuthenticated = () => {
  const token = getCookie('token')
  if (token && isTokenValid(token)) {
    return redirect('/')
  }
  return null
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Pages.Main.Home /> },
      { path: 'about', element: <Pages.Main.About /> },
      { path: 'courses', element: <Pages.Main.Courses /> },
      { path: 'courses/:courseId', element: <Pages.Main.CourseDetails /> },
      { path: 'contact', element: <Pages.Main.Contact /> }
    ],
    errorElement: <ErrorBoundary />
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    loader: redirectIfAuthenticated,
    children: [
      { path: 'login', element: <Pages.Auth.Login /> },
      { path: 'signup', element: <Pages.Auth.Register /> }
    ],
    errorElement: <ErrorBoundary />
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    loader: authGuard,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/dashboard/classroom',
    element: <ClassRoomLayout />,
    loader: authGuard,
    children: [
      { index: true, element: <Pages.Dashboard.ClassRoom /> },
      { path: ':courseId/lessons/:lessonId', element: <Pages.Dashboard.ClassRoom /> }
    ]
  }
])
import Cookies from 'js-cookie'

export function setToken(token: string) {
  Cookies.set('admin_token', token, {
    expires: 1,
    secure: process.env.NODE_ENV === 'production',
  })
}

export function getToken() {
  return Cookies.get('admin_token')
}

export function removeToken() {
  Cookies.remove('admin_token')
}

export function isAuthenticated() {
  return !!getToken()
}

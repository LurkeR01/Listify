export const authStore = {
  accessToken: null as string | null,

  setAccessToken(token: string | null) {
    this.accessToken = token
  },

  getAccessToken() {
    return this.accessToken
  }
}
/**
 * Auth.js reports failures as short machine codes. They are mapped here to
 * messages that are useful without being an oracle: every credential failure
 * — unknown email, wrong password, malformed input — collapses into the same
 * sentence, so this page can't be used to test which addresses have accounts.
 */
export function friendlyAuthError(code) {
  switch (code) {
    case "CredentialsSignin":
      return "That email and password combination didn't work.";
    case "OAuthAccountNotLinked":
      return "An account with this email already exists. Sign in with your password instead, or use the provider you originally signed up with.";
    case "OAuthSignin":
    case "OAuthCallbackError":
    case "OAuthCallback":
      return "Google sign-in didn't complete. Please try again.";
    case "AccessDenied":
      return "Access denied.";
    case "SessionRequired":
      return "Please sign in to continue.";
    case "Configuration":
      return "Sign-in isn't configured correctly on this deployment.";
    default:
      return "Could not sign you in. Please try again.";
  }
}

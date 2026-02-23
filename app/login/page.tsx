import LoginForm from "./LoginForm";

type Props = { searchParams: { error?: string } };

export default function LoginPage({ searchParams }: Props) {
  const oauthError = searchParams.error === "auth" ? "Sign-in was cancelled or failed. Please try again." : null;
  return <LoginForm oauthError={oauthError} />;
}

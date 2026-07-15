import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "4rem" }}>
      <SignUp forceRedirectUrl="/dashboard" />
    </div>
  );
}
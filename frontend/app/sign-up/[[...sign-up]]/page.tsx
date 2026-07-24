import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        background: "#FFFBF2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-fredoka), sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "#2B2118",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "#FF6B4A",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          C
        </span>
        Contendo
      </Link>
      <p style={{ color: "#6B5D4F", fontSize: 15, marginBottom: 28 }}>Start training today.</p>

      <SignUp
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#FF6B4A",
            colorBackground: "#FFFFFF",
            colorText: "#2B2118",
            colorTextSecondary: "#6B5D4F",
            colorInputText: "#2B2118",
            borderRadius: "12px",
            fontFamily: "var(--font-jakarta), sans-serif",
          },
          elements: {
            card: {
              boxShadow: "none",
              border: "1px solid #F0E6D6",
            },
            formButtonPrimary: {
              backgroundColor: "#FF6B4A",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#D9502F" },
            },
          },
        }}
      />
    </div>
  );
}
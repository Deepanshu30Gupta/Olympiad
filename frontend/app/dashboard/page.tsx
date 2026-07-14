import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard (placeholder)</h1>
      <p>If you can see this, you are signed in.</p>
      <p>Signed in as: {user?.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
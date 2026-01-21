
import { Navbar } from "@/components/layout/Navbar";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <SignupForm />
      </main>
    </div>
  );
}

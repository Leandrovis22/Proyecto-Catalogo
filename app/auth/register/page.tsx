import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
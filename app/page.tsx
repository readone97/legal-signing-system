'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  role: z.enum(['PARTY_A', 'PARTY_B', 'NOTARY']),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  const onSubmit = async (data: LoginForm | RegisterForm) => {
    try {
      if (isRegister) {
        // Register API call
        await axios.post('/api/auth/register', data); // Custom register endpoint if needed
      }
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (res?.ok) router.push('/dashboard');
      else alert(res?.error);
    } catch (err) {
      alert('Auth error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">{isRegister ? 'Register' : 'Login'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} placeholder="Email" className="block w-full border rounded p-2" />
        <input {...register('password')} type="password" placeholder="Password" className="block w-full border rounded p-2" />
        {isRegister && (
          <select {...register('role')} className="block w-full border rounded p-2">
            <option value="PARTY_A">Party A</option>
            <option value="PARTY_B">Party B</option>
            <option value="NOTARY">Notary</option>
          </select>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className="mt-4 text-blue-600">
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </div>
  );
}